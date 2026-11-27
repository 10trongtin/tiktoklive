import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData, readProofImageBuffer } from '@/lib/repository';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const data = await getAllAppData();
  const proof = data.proofs.find((p) => p.sessionId === sessionId);
  if (!proof) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Chỉ Admin hoặc chính Streamer chủ sở hữu bằng chứng mới được xem ảnh
  if (user.role !== 'admin' && proof.streamerId !== user.streamerId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const img = await readProofImageBuffer(proof.imagePath);
  if (!img) {
    return NextResponse.json({ error: 'File missing' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(img.buffer), {
    status: 200,
    headers: {
      'Content-Type': img.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
