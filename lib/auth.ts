// lib/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'USER' | 'ADMIN';
};

const SESSION_COOKIE = 'session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    if (!payload.userId || !payload.email || !payload.role) return null;
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) ?? null,
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/khyberopen?callbackUrl=/dashboard');
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/khyberopen?callbackUrl=/admin/products');
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}
