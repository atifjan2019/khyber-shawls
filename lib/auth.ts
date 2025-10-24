import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const SESSION_COOKIE = "ks_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Please define JWT_SECRET in your environment configuration."
    )
  }
  return secret
}

type SessionPayload = {
  userId: string
  role: Role
}

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: Role
}

export async function hashPassword(password: string) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

function signSession(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: SESSION_MAX_AGE })
}

function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload
  } catch (error) {
    console.error("Failed to verify session token", error)
    return null
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signSession(payload)
  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionToken) {
    return null
  }

  const payload = verifySession(sessionToken)
  if (!payload) {
    clearSessionCookie()
    return null
  }

  if (!prisma) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!user) {
    clearSessionCookie()
    return null
  }

  return user
}

export async function requireUser(options?: { mustBeAdmin?: boolean }) {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  if (options?.mustBeAdmin && user.role !== "ADMIN") {
    return null
  }

  return user
}
