'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSessionUser } from '@/lib/auth';
import {
  createSeasonRecord,
  updateAutomationSettings,
} from '@/lib/repository';

export async function createSeasonAction(input: {
  name: string;
  startDate: string;
  endDate: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Chỉ Quản trị viên mới có quyền tạo mùa giải mới.' };
  }

  const res = await createSeasonRecord({
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    createdBy: user.id,
  });

  if (!res.ok) return res;
  revalidatePath('/mua-giai');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function saveRulesAndApiConfigAction(input: {
  autoOpenCloseSession: boolean;
  autoDraftPoints: boolean;
  autoApproveValidSessions: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    return { ok: false, error: 'Chỉ Quản trị viên mới có quyền lưu cấu hình.' };
  }

  const res = await updateAutomationSettings(input);
  if (!res.ok) return res;

  revalidatePath('/luat-diem-api');
  revalidatePath('/', 'layout');
  return { ok: true };
}
