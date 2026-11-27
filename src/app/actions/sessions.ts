'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSessionUser } from '@/lib/auth';
import { reviewLiveSessionRecord } from '@/lib/repository';

export async function reviewSessionAction(input: {
  sessionId: string;
  action: 'approve' | 'reject';
  rejectReason?: string;
}): Promise<
  | { ok: true; streamerName: string; durationMinutes: number }
  | { ok: false; error: string }
> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Chỉ Quản trị viên mới có quyền duyệt phiên live.' };
  }

  const res = await reviewLiveSessionRecord({
    sessionId: input.sessionId,
    action: input.action,
    reviewerId: user.id,
    reviewerName: user.fullName,
    rejectReason: input.rejectReason,
  });

  if (!res.ok) return res;

  revalidatePath('/duyet-phien-live');
  revalidatePath('/chi-tiet-streamer');
  revalidatePath('/dashboard-cua-toi');
  revalidatePath('/tong-quan-dieu-hanh');
  revalidatePath('/', 'layout');

  return {
    ok: true,
    streamerName: res.streamerName,
    durationMinutes: res.session.durationMinutes,
  };
}
