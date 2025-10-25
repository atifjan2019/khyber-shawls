"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // ← use prisma directly

type AuthActionState = {
  error?: string;
};

const registerSchema = z.object({
  name: z.string().min(2, "Please provide your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  redirectTo: z.string().optional(),
});

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form submission" };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { error: "An account already exists for this email." };
    }

    const hashedPassword = await hashPassword(parsed.data.password);
    const hasAdmin = await prisma.user.count({ where: { role: "ADMIN" } });

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: hasAdmin === 0 ? "ADMIN" : "USER",
      },
    });

    await setSessionCookie({ userId: user.id, role: user.role });
    revalidatePath("/");

    redirect(parsed.data.redirectTo || "/dashboard");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error while registering.";
    return { error: message };
  }
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  redirectTo: z.string().optional(),
});

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return { error: "No account found for this email." };
    }

    const passwordValid = await verifyPassword(parsed.data.password, user.password);
    if (!passwordValid) {
      return { error: "Invalid email or password." };
    }

    await setSessionCookie({ userId: user.id, role: user.role });
    revalidatePath("/");

    if (parsed.data.redirectTo) redirect(parsed.data.redirectTo);
    if (user.role === "ADMIN") redirect("/admin");

    redirect("/dashboard");
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error while logging in.";
    return { error: message };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  revalidatePath("/");
  redirect("/");
}
