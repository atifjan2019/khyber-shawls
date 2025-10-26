// app/(auth)/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type LoginState = { error?: string };

const SESSION_COOKIE = 'session';

function hashToId(email: string) {
  return Buffer.from(email).toString('base64url').slice(0, 16);
}

function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '') || '/';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  // TEMP auth: accept any non-empty creds; set role from ADMIN_EMAILS
  const role = isAdminEmail(email) ? 'ADMIN' : 'USER';

  const sessionPayload = JSON.stringify({
    id: hashToId(email),
    email,
    name: null,
    role,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionPayload, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  // If they’re admin and going to /dashboard, nudge to admin overview.
  if (role === 'ADMIN' && (callbackUrl === '/' || callbackUrl === '/dashboard')) {
    redirect('/admin/products');
  }

  redirect(callbackUrl);
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect('/login');
}
