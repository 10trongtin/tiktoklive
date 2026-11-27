'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import {
  markNotificationsRead,
  verifyLocalCredentials,
} from '@/lib/repository';
import {
  getCurrentSessionUser,
  LOCAL_SESSION_COOKIE,
  signLocalUserId,
} from '@/lib/auth';

export async function signInAction(
  identifier: string,
  password: string
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  if (!identifier.trim() || !password) {
    return { ok: false, error: 'Vui lòng nhập Email / SĐT và mật khẩu.' };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    });
    if (error || !data.user) {
      return { ok: false, error: 'Thông tin đăng nhập không chính xác.' };
    }
    revalidatePath('/', 'layout');
    return { ok: true, redirectTo: '/' };
  }

  const verified = await verifyLocalCredentials(identifier, password);
  if (!verified) {
    return { ok: false, error: 'Email / SĐT hoặc mật khẩu không chính xác.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, signLocalUserId(verified.id), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath('/', 'layout');
  return {
    ok: true,
    redirectTo: verified.role === 'streamer' ? '/dashboard-cua-toi' : '/',
  };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(LOCAL_SESSION_COOKIE);
  }
  revalidatePath('/', 'layout');
  redirect('/dang-nhap');
}

export async function clearBellUnreadAction() {
  const user = await getCurrentSessionUser();
  if (!user) return;
  await markNotificationsRead(user.role, user.streamerId);
  revalidatePath('/', 'layout');
}
