import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getCurrentSessionUser } from '@/lib/auth';
import {
  getActiveSeason,
  getAllAppData,
  recordReportExport,
} from '@/lib/repository';
import { computeLeaderboard, getPeriodBounds } from '@/lib/scoring';
import {
  formatDuration,
  formatShortDateTime,
  getVietnamMonthBounds,
  getVietnamWeekBounds,
} from '@/lib/formatters';
import { canExportRankingExcel } from '@/lib/permissions';
import { RankingPeriodTab, ReportType } from '@/types/domain';

export async function POST(request: NextRequest) {
  const user = await getCurrentSessionUser();
  if (!user || !canExportRankingExcel(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json()) as {
    reportType?: ReportType;
    periodTab?: RankingPeriodTab;
  };

  const data = await getAllAppData();
  const now = new Date();
  const activeSeason = getActiveSeason(data.seasons);
  const tab = body.periodTab ?? 'tuan_nay';
  const periodLabel =
    tab === 'tuan_nay'
      ? getVietnamWeekBounds(now).label
      : tab === 'thang_nay'
        ? getVietnamMonthBounds(now).label
        : activeSeason?.name ?? 'Từ đầu mùa';

  await recordReportExport({
    reportName: 'Bảng xếp hạng (CSV)',
    reportType: body.reportType ?? 'ranking_csv',
    periodLabel,
    exportedBy: user.id,
    exportedByName: user.fullName,
    queryParams: { tab },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const user = await getCurrentSessionUser();
  if (!user || !canExportRankingExcel(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') ?? 'weekly') as ReportType;
  const streamerFilter = searchParams.get('streamerId') ?? '';
  const skipLog = searchParams.get('redownload') === '1';

  const data = await getAllAppData();
  const now = new Date();
  const weekBounds = getVietnamWeekBounds(now);
  const monthBounds = getVietnamMonthBounds(now);
  const activeStreamers = data.streamers.filter((s) => s.active);

  const teamMap = new Map(data.teams.map((t) => [t.id, t.name]));
  const projMap = new Map(data.projects.map((p) => [p.id, p.name]));
  const streamerMap = new Map(data.streamers.map((s) => [s.id, s]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PICITY LÊN LIVE';
  workbook.created = now;

  let reportDisplayName = 'Báo cáo tuần';
  let periodLabel = weekBounds.label;
  let fileName = `picity-bao-cao-tuan-${weekBounds.shortSlug}.xlsx`;

  if (type === 'weekly') {
    reportDisplayName = 'Báo cáo tuần';
    periodLabel = weekBounds.label;
    fileName = `picity-bao-cao-tuan-${weekBounds.shortSlug}.xlsx`;

    const ranked = computeLeaderboard({
      streamers: activeStreamers,
      sessions: data.liveSessions,
      startUtc: weekBounds.startUtc,
      endUtc: weekBounds.endUtc,
      minSessionMinutes: data.settings.minSessionMinutes,
      pointsPerValidSession: data.settings.pointsPerValidSession,
    });

    const sheet = workbook.addWorksheet('Báo cáo tuần');
    sheet.columns = [
      { header: 'Hạng', key: 'rank', width: 8 },
      { header: 'Streamer', key: 'name', width: 24 },
      { header: '@TikTok', key: 'tiktok', width: 20 },
      { header: 'Team', key: 'team', width: 18 },
      { header: 'Dự án', key: 'project', width: 22 },
      { header: 'Số phiên hợp lệ', key: 'sessions', width: 16 },
      { header: 'Tổng giờ live', key: 'hours', width: 16 },
      { header: 'Peak view', key: 'peak', width: 14 },
      { header: 'Điểm', key: 'points', width: 10 },
      { header: 'Đạt KPI tuần (≥ 4h)', key: 'kpi', width: 20 },
    ];

    for (const r of ranked) {
      sheet.addRow({
        rank: r.rank,
        name: r.streamer.displayName,
        tiktok: r.streamer.tiktokUsername,
        team: teamMap.get(r.streamer.teamId) ?? '—',
        project: projMap.get(r.streamer.projectId) ?? '—',
        sessions: r.validSessionsCount,
        hours: formatDuration(r.totalMinutes),
        peak: r.peakViewers > 0 ? r.peakViewers : '—',
        points: r.points,
        kpi:
          r.totalMinutes >= data.settings.weeklyKpiMinutes
            ? 'Đạt KPI'
            : r.validSessionsCount === 0
              ? 'Chưa live'
              : 'Chưa đạt',
      });
    }
  } else if (type === 'streamer_detail') {
    const targetSt = streamerFilter ? streamerMap.get(streamerFilter) : null;
    reportDisplayName = targetSt
      ? `Chi tiết phiên — ${targetSt.displayName}`
      : 'Chi tiết phiên theo streamer';
    periodLabel = weekBounds.label;
    fileName = `picity-chi-tiet-phien-${weekBounds.shortSlug}.xlsx`;

    const sheet = workbook.addWorksheet('Chi tiết phiên');
    sheet.columns = [
      { header: 'Streamer', key: 'streamer', width: 24 },
      { header: '@TikTok', key: 'tiktok', width: 18 },
      { header: 'Team', key: 'team', width: 16 },
      { header: 'Dự án', key: 'project', width: 22 },
      { header: 'Tiêu đề phiên', key: 'title', width: 30 },
      { header: 'Giờ bắt đầu', key: 'started', width: 18 },
      { header: 'Thời lượng', key: 'duration', width: 14 },
      { header: 'Peak view', key: 'peak', width: 12 },
      { header: 'Trạng thái duyệt', key: 'status', width: 22 },
    ];

    const filteredSessions = data.liveSessions.filter((s) =>
      streamerFilter ? s.streamerId === streamerFilter : true
    );

    for (const s of filteredSessions) {
      const st = streamerMap.get(s.streamerId);
      let statusLabel = 'Chờ duyệt';
      if (s.reviewStatus === 'dang_live') statusLabel = '● ĐANG LIVE';
      else if (s.reviewStatus === 'cho_duyet_tay')
        statusLabel = 'Chờ duyệt tay';
      else if (s.reviewStatus === 'da_duyet') statusLabel = 'Đã duyệt';
      else if (s.reviewStatus === 'tu_choi')
        statusLabel =
          s.durationMinutes < data.settings.minSessionMinutes
            ? 'Từ chối · < 30 phút'
            : `Từ chối · ${s.rejectReason || ''}`;

      sheet.addRow({
        streamer: st?.displayName ?? s.tiktokUsername,
        tiktok: s.tiktokUsername,
        team: st ? teamMap.get(st.teamId) ?? '—' : '—',
        project: projMap.get(s.projectId) ?? '—',
        title: s.title,
        started: formatShortDateTime(s.startedAt),
        duration: formatDuration(s.durationMinutes),
        peak: s.peakViewers > 0 ? s.peakViewers : '—',
        status: statusLabel,
      });
    }
  } else {
    // CN-13 QT-01 & AC-01: Bảng điểm chốt tháng — chỉ gồm phiên ĐÃ DUYỆT, kèm người duyệt và giờ duyệt!
    reportDisplayName = 'Bảng điểm chốt tháng';
    periodLabel = monthBounds.label;
    fileName = `picity-bang-diem-chot-thang-${monthBounds.label.replace(
      'Tháng ',
      ''
    ).replace('/', '-')}.xlsx`;

    const startMs = monthBounds.startUtc.getTime();
    const endMs = monthBounds.endUtc.getTime();

    const summarySheet = workbook.addWorksheet('Tổng hợp điểm tháng');
    summarySheet.columns = [
      { header: 'Hạng', key: 'rank', width: 8 },
      { header: 'Streamer', key: 'streamer', width: 24 },
      { header: '@TikTok', key: 'tiktok', width: 18 },
      { header: 'Team', key: 'team', width: 16 },
      { header: 'Dự án', key: 'project', width: 22 },
      { header: 'Số phiên hợp lệ', key: 'sessions', width: 16 },
      { header: 'Tổng giờ live', key: 'hours', width: 16 },
      { header: 'Điểm chốt tháng', key: 'points', width: 16 },
    ];

    const monthRank = computeLeaderboard({
      streamers: activeStreamers,
      sessions: data.liveSessions,
      startUtc: monthBounds.startUtc,
      endUtc: monthBounds.endUtc,
      minSessionMinutes: data.settings.minSessionMinutes,
      pointsPerValidSession: data.settings.pointsPerValidSession,
    });

    for (const r of monthRank) {
      summarySheet.addRow({
        rank: r.rank,
        streamer: r.streamer.displayName,
        tiktok: r.streamer.tiktokUsername,
        team: teamMap.get(r.streamer.teamId) ?? '—',
        project: projMap.get(r.streamer.projectId) ?? '—',
        sessions: r.validSessionsCount,
        hours: formatDuration(r.totalMinutes),
        points: r.points,
      });
    }

    const detailSheet = workbook.addWorksheet('Phiên đã duyệt kèm người duyệt');
    detailSheet.columns = [
      { header: 'Streamer', key: 'streamer', width: 24 },
      { header: '@TikTok', key: 'tiktok', width: 18 },
      { header: 'Giờ bắt đầu', key: 'started', width: 18 },
      { header: 'Thời lượng', key: 'duration', width: 14 },
      { header: 'Điểm đã chốt', key: 'points', width: 14 },
      { header: 'Người duyệt', key: 'reviewer', width: 22 },
      { header: 'Giờ duyệt', key: 'reviewedAt', width: 18 },
    ];

    const approvedInMonth = data.liveSessions.filter((s) => {
      if (s.reviewStatus !== 'da_duyet') return false;
      const ms = new Date(s.startedAt).getTime();
      return ms >= startMs && ms <= endMs;
    });

    for (const s of approvedInMonth) {
      const st = streamerMap.get(s.streamerId);
      detailSheet.addRow({
        streamer: st?.displayName ?? s.tiktokUsername,
        tiktok: s.tiktokUsername,
        started: formatShortDateTime(s.startedAt),
        duration: formatDuration(s.durationMinutes),
        points: s.finalPoints,
        reviewer: s.reviewedByName ?? 'Admin Picity',
        reviewedAt: s.reviewedAt ? formatShortDateTime(s.reviewedAt) : '—',
      });
    }
  }

  if (!skipLog) {
    await recordReportExport({
      reportName: reportDisplayName,
      reportType: type,
      periodLabel,
      exportedBy: user.id,
      exportedByName: user.fullName,
      queryParams: streamerFilter ? { streamerId: streamerFilter } : {},
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
