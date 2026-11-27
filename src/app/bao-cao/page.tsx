import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import {
  formatRelativeDateTime,
  getVietnamWeekBounds,
} from '@/lib/formatters';
import {
  ExportHistoryRow,
  ReportsClient,
} from '@/app/bao-cao/ReportsClient';

export default async function ReportsPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }
  if (user.role !== 'admin' && user.role !== 'executive') {
    redirect('/');
  }

  const data = await getAllAppData();
  const now = new Date();
  const weekBounds = getVietnamWeekBounds(now);

  const streamers = data.streamers
    .filter((s) => s.active)
    .map((s) => ({
      id: s.id,
      label: `${s.displayName} (${s.tiktokUsername})`,
    }));

  const history: ExportHistoryRow[] = data.reportExports.map((ex) => ({
    id: ex.id,
    reportName: ex.reportName,
    reportType: ex.reportType,
    periodLabel: ex.periodLabel,
    exportedByName: ex.exportedByName,
    exportedAtLabel: formatRelativeDateTime(ex.exportedAt, now, true),
    streamerIdParam: ex.queryParams?.streamerId,
  }));

  return (
    <ReportsClient
      weekLabel={weekBounds.label}
      streamers={streamers}
      history={history}
    />
  );
}
