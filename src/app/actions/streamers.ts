'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSessionUser } from '@/lib/auth';
import {
  createRegistrationRecord,
  reviewRegistrationRecord,
  sendLiveReminderRecord,
} from '@/lib/repository';

export async function submitRegistrationAction(input: {
  fullName: string;
  phoneZalo: string;
  tiktokRaw: string;
  workEmail?: string;
  teamId: string;
  projectId: string;
  committed: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await createRegistrationRecord(input);
  if (!res.ok) return res;
  revalidatePath('/duyet-dang-ky');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function reviewRegistrationAction(input: {
  registrationId: string;
  action: 'approve' | 'reject';
  rejectReason?: string;
}): Promise<
  | {
      ok: true;
      fullName: string;
      provisionedCredentials?: { loginEmail: string; initialPassword: string };
    }
  | { ok: false; error: string }
> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Chỉ Quản trị viên mới có quyền duyệt đăng ký.' };
  }

  const res = await reviewRegistrationRecord({
    registrationId: input.registrationId,
    action: input.action,
    reviewerId: user.id,
    rejectReason: input.rejectReason,
  });

  if (!res.ok) return res;

  revalidatePath('/duyet-dang-ky');
  revalidatePath('/quan-ly-streamer');
  revalidatePath('/', 'layout');

  return {
    ok: true,
    fullName: res.registration.fullName,
    provisionedCredentials: res.provisionedCredentials,
  };
}

export async function remindStreamerLiveAction(
  streamerId: string
): Promise<{ ok: true; streamerName: string } | { ok: false; error: string }> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Chỉ Quản trị viên mới có quyền nhắc live.' };
  }

  const res = await sendLiveReminderRecord(streamerId);
  if (!res.ok) return res;
  revalidatePath('/quan-ly-streamer');
  return res;
}
