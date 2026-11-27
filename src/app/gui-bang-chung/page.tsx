import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import { formatSessionTimeRange } from '@/lib/formatters';
import {
  FlaggedSessionOption,
  SubmitProofClient,
} from '@/app/gui-bang-chung/SubmitProofClient';

export default async function SubmitProofPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }
  if (user.role !== 'streamer' || !user.streamerId) {
    redirect('/');
  }

  const data = await getAllAppData();
  const nowMs = Date.now();

  // QT-01 & QT-02 CN-07: Chỉ phiên của mình, bị gắn cờ thiếu dữ liệu, chưa gửi bằng chứng, còn trong hạn 24h
  const flaggedSessions: FlaggedSessionOption[] = data.liveSessions
    .filter((sess) => {
      if (sess.streamerId !== user.streamerId) return false;
      if (sess.dataFlag !== 'thieu_du_lieu') return false;
      if (sess.reviewStatus !== 'cho_duyet') return false;
      if (sess.endedAt) {
        const hours = (nowMs - new Date(sess.endedAt).getTime()) / (3600 * 1000);
        if (hours > 24) return false;
      }
      return true;
    })
    .map((sess) => {
      const rangeStr = formatSessionTimeRange(sess.startedAt, sess.endedAt);
      const reason = sess.dataFlagReason
        ? `Thiếu dữ liệu (${sess.dataFlagReason})`
        : 'Thiếu dữ liệu';
      return {
        id: sess.id,
        label: `${rangeStr} · ${reason}`,
      };
    });

  return <SubmitProofClient flaggedSessions={flaggedSessions} />;
}
