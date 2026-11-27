import { NextRequest, NextResponse } from 'next/server';
import { recordReportExport } from '@/lib/repository';
import { getVietnamWeekBounds } from '@/lib/formatters';

/**
 * CN-13 QT-03 & AC-03:
 * "Báo cáo tuần tự động sẵn sàng vào 07:00 mỗi sáng thứ 2."
 * Cron job chạy 07:00 Thứ 2 (00:00 UTC Thứ 2) ghi sẵn bản ghi báo cáo tuần trước vào Lịch sử xuất báo cáo.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'picity-cron-secret';
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const previousWeekRef = new Date(Date.now() - 24 * 3600 * 1000);
  const prevWeek = getVietnamWeekBounds(previousWeekRef);

  const rec = await recordReportExport({
    reportName: 'Báo cáo tuần',
    reportType: 'weekly',
    periodLabel: prevWeek.label,
    exportedBy: null,
    exportedByName: 'Hệ thống tự động (07:00 Thứ 2)',
    queryParams: {},
  });

  return NextResponse.json({ ok: true, report: rec });
}
