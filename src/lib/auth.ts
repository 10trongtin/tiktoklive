import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AuthSessionUser, UserRole } from '@/types/domain';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { getLocalUserById } from '@/lib/repository';
import { makeAvatarInitials } from '@/lib/formatters';

export const LOCAL_SESSION_COOKIE = 'picity_session';

function getCookieSecret(): string {
  return process.env.SESSION_SECRET || 'picity-len-live-secret-key-2026';
}

export function signLocalUserId(userId: string): string {
  const sig = crypto
    .createHmac('sha256', getCookieSecret())
    .update(userId)
    .digest('hex');
  return `${userId}.${sig}`;
}

export function verifySignedLocalToken(token: string): string | null {
  const idx = token.lastIndexOf('.');
  if (idx <= 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto
    .createHmac('sha256', getCookieSecret())
    .update(userId)
    .digest('hex');
  if (sig.length !== expected.length) return null;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ? userId
    : null;
}

export async function getCurrentSessionUser(): Promise<AuthSessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: profile }, { data: streamer }] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('streamers').select('id').eq('user_id', user.id).eq('active', true).maybeSingle(),
    ]);

    const role: UserRole = (profile?.role as UserRole) ?? 'streamer';
    const fullName = profile?.full_name ?? user.email ?? 'Người dùng Picity';
    const roleTitle =
      role === 'admin'
        ? 'Quản trị viên'
        : role === 'executive'
          ? 'Cấp điều hành'
          : 'Streamer';
    const sidebarRoleTitle =
      role === 'admin' ? 'Quản trị viên hệ thống' : roleTitle;

    return {
      id: user.id,
      email: user.email ?? '',
      phone: profile?.phone ?? undefined,
      fullName,
      role,
      roleTitle,
      sidebarRoleTitle,
      avatarInitials: profile?.avatar_initials ?? makeAvatarInitials(fullName),
      streamerId: streamer?.id,
    };
  }

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  const userId = verifySignedLocalToken(rawToken);
  if (!userId) return null;
  return getLocalUserById(userId);
}
