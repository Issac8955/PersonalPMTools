'use server';

import { cookies } from 'next/headers';

export async function loginAction(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { success: false, error: 'ADMIN_PASSWORD is not set in .env.local' };
  }

  if (password === adminPassword) {
    // 1. Await the cookies() promise in Next.js 15+
    const cookieStore = await cookies();

    // 2. Call .set() on the resolved cookieStore instance
    cookieStore.set('auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  }

  return { success: false, error: 'Invalid admin password' };
}