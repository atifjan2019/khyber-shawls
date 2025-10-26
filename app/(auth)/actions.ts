// app/(auth)/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/passwords';

export type LoginState = { error?: string };

const SESSION_COOKIE = 'session';

function hashToId(email: string) {
  return Buffer.from(email).toString('base64url').slice(0, 16);
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '') || '/dashboard';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // 1) Find user
  const user = await prisma.user.findUnique({ where: { email } });

  // 2) If no user, allow first-time admin bootstrap using env (optional)
  if (!user) {
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    if (envAdminEmail && envAdminPassword && email === envAdminEmail) {
      // auto-provision the admin user on first login using env password
      const passwordHash = await hashPassword(envAdminPassword);
      const created = await prisma.user.create({
        data: {
          email,
          name: process.env.ADMIN_NAME || 'Khyber Admin',
          role: 'ADMIN',
          passwordHash,
        },
      });

      // verify given password
      const ok = password === envAdminPassword;
      if (!ok) return { error: 'Invalid email or password.' };

      const jar = await cookies();
      jar.set(SESSION_COOKIE, JSON.stringify({
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
      }), {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      });

      // admins go to admin overview by default
      redirect('/admin/overview');
      return {};
    }

    // Otherwise, no account
    return { error: 'No account found for this email.' };
  }

  // 3) Verify password
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: 'Invalid email or password.' };
  }

  // 4) Create session cookie with user info
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  // 5) Redirect by role
  if (user.role === 'ADMIN' && (callbackUrl === '/' || callbackUrl === '/dashboard')) {
    redirect('/admin/overview');
  }

  redirect(callbackUrl);
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect('/login');
}
