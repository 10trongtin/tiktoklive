import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { formatSessionTimeRange } from '@/lib/formatters';
import {
  PendingSessionItem,
  SessionApproveClient,
} from '@/app/duyet-phien-live/SessionApproveClient';

export default async function SessionApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ streamerId?: string }>;
}) {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const resolvedParams = await searchParams;
  const filterStreamerId = resolvedParams.streamerId;

  const data = await getAllAppData();
  const streamerMap = new Map(data.streamers.map((s) => [s.id, s]));
  const proofMap = new Map(data.proofs.map((p) => [p.sessionId, p]));

  // QT-01 CN-08 & CH-04: Hàng chờ gồm phiên Chờ duyệt và Chờ duyệt tay (phiên < 30p đã tự chuyển tu_choi), cũ trước
  const pendingSessions = data.liveSessions
    .filter((sess) => {
      if (
        sess.reviewStatus !== 'cho_duyet' &&
        sess.reviewStatus !== 'cho_duyet_tay'
      ) {
        return false;
      }
      if (filterStreamerId && sess.streamerId !== filterStreamerId) {
        return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

  const items: PendingSessionItem[] = pendingSessions.map((sess) => {
    const st = streamerMap.get(sess.streamerId);
    const proof = proofMap.get(sess.id);

    return {
      id: sess.id,
      streamerName: st?.displayName ?? sess.tiktokUsername,
      avatarInitials: st?.avatarInitials ?? 'PC',
      tiktokUsername: sess.tiktokUsername,
      timeRangeLabel: formatSessionTimeRange(sess.startedAt, sess.endedAt),
      durationMinutes: sess.durationMinutes,
      peakViewers: sess.peakViewers,
      draftPoints: sess.draftPoints,
      dataFlag: sess.dataFlag,
      dataFlagReason: sess.dataFlagReason,
      hasProof: Boolean(proof),
      proofReportedDuration: proof?.reportedDurationText,
      proofNote: proof?.noteForAdmin,
      proofStreamUrl: proof?.streamUrl,
    };
  });

  const filteredStreamerName = filterStreamerId
    ? streamerMap.get(filterStreamerId)?.displayName ?? null
    : null;

  return (
    <SessionApproveClient
      initialItems={items}
      filteredStreamerName={filteredStreamerName}
    />
  );
}
