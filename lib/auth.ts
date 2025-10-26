// lib/auth.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';



export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'USER' | 'ADMIN';
};

const SESSION_COOKIE = 'session';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const u = JSON.parse(raw) as Partial<AuthUser>;
    if (!u?.id || !u?.email || !u?.role) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/dashboard');
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/admin/products');
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}
