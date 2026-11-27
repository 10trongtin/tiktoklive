import { NextRequest, NextResponse } from 'next/server';
import {
  applyLiveRoomsSync,
  ExternalRoomSnapshot,
  getAllAppData,
} from '@/lib/repository';
import { createLiveTrackingProvider } from '@/lib/live-provider';
import { getCurrentSessionUser } from '@/lib/auth';

/**
 * Endpoint đồng bộ trạng thái phòng live từ dịch vụ đọc phòng live bên thứ ba:
 * - Hỗ trợ GET (Cron định kỳ gọi qua CRON_SECRET) để tự quét toàn bộ tài khoản đã duyệt
 * - Hỗ trợ POST (Webhook từ dịch vụ đọc phòng live hoặc Admin kiểm thử luồng live)
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'picity-cron-secret';
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await getAllAppData();
  const handles = data.streamers
    .filter((s) => s.active)
    .map((s) => s.tiktokUsername);

  const provider = createLiveTrackingProvider();
  try {
    const snapshots = await provider.fetchRoomsStatus(handles);
    const summary = await applyLiveRoomsSync(snapshots, new Date());
    return NextResponse.json({ ok: true, provider: provider.name, ...summary });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Provider error' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'picity-cron-secret';
  const authHeader = request.headers.get('authorization');
  const sessionUser = await getCurrentSessionUser();

  if (
    authHeader !== `Bearer ${cronSecret}` &&
    sessionUser?.role !== 'admin'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    rooms?: ExternalRoomSnapshot[];
    timestamp?: string;
  };

  if (!Array.isArray(body.rooms)) {
    return NextResponse.json(
      { ok: false, error: 'Missing rooms array' },
      { status: 400 }
    );
  }

  const refDate = body.timestamp ? new Date(body.timestamp) : new Date();
  const summary = await applyLiveRoomsSync(body.rooms, refDate);
  return NextResponse.json({ ok: true, ...summary });
}
