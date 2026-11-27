import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCurrentSessionUser } from '@/lib/auth';
import { submitSessionProofRecord } from '@/lib/repository';

export async function POST(request: NextRequest) {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'streamer' || !user.streamerId) {
    return NextResponse.json(
      { ok: false, error: 'Chỉ Streamer mới có quyền gửi bằng chứng phiên live của mình.' },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const sessionId = String(formData.get('sessionId') ?? '').trim();
  const reportedDurationText = String(
    formData.get('reportedDurationText') ?? ''
  ).trim();
  const streamUrl = String(formData.get('streamUrl') ?? '').trim();
  const noteForAdmin = String(formData.get('noteForAdmin') ?? '').trim();
  const file = formData.get('proofImage');

  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: 'Vui lòng chọn Phiên cần bổ sung bằng chứng.' },
      { status: 400 }
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { ok: false, error: 'Vui lòng chọn Ảnh màn hình cuối live.' },
      { status: 400 }
    );
  }

  const arrBuf = await file.arrayBuffer();
  const res = await submitSessionProofRecord({
    sessionId,
    streamerId: user.streamerId,
    reportedDurationText,
    streamUrl: streamUrl || undefined,
    noteForAdmin: noteForAdmin || undefined,
    fileName: file.name,
    mimeType: file.type,
    fileBuffer: Buffer.from(arrBuf),
  });

  if (!res.ok) {
    return NextResponse.json(res, { status: 400 });
  }

  revalidatePath('/gui-bang-chung');
  revalidatePath('/dashboard-cua-toi');
  revalidatePath('/duyet-phien-live');
  revalidatePath('/', 'layout');

  return NextResponse.json({ ok: true });
}
