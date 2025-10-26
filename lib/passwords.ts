// lib/passwords.ts
import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export async function hashPassword(raw: string) {
  return bcrypt.hash(raw, ROUNDS);
}

export async function verifyPassword(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}
