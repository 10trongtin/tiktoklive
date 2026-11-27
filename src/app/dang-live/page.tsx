import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { getAllAppData } from '@/lib/repository';
import {
  ActiveLiveCardItem,
  LiveRoomsClient,
} from '@/app/dang-live/LiveRoomsClient';

export default async function LiveRoomsPage() {
  const user = await getCurrentSessionUser();
  if (!user) {
    redirect('/dang-nhap');
  }

  const data = await getAllAppData();
  const now = new Date();
  const streamerMap = new Map(data.streamers.map((s) => [s.id, s]));
  const projectMap = new Map(data.projects.map((p) => [p.id, p]));

  const canViewProfile = user.role === 'admin' || user.role === 'executive';

  // Sắp xếp theo số người xem giảm dần
  const activeSessions = data.liveSessions
    .filter((s) => {
      if (s.reviewStatus !== 'dang_live') return false;
      const st = streamerMap.get(s.streamerId);
      return Boolean(st && st.active);
    })
    .sort((a, b) => b.currentViewers - a.currentViewers);

  const rooms: ActiveLiveCardItem[] = activeSessions.map((sess) => {
    const st = streamerMap.get(sess.streamerId)!;
    const proj = projectMap.get(sess.projectId) ?? projectMap.get(st.projectId);
    const liveMinutes = Math.max(
      sess.durationMinutes,
      Math.max(
        1,
        Math.round((now.getTime() - new Date(sess.startedAt).getTime()) / 60000)
      )
    );

    return {
      sessionId: sess.id,
      streamerId: st.id,
      streamerName: st.displayName,
      avatarInitials: st.avatarInitials,
      tiktokUsername: st.tiktokUsername,
      title: sess.title,
      projectName: proj?.name ?? 'Picity Central Park',
      currentViewers: sess.currentViewers,
      liveMinutes,
      streamUrl:
        sess.streamUrl || `https://www.tiktok.com/${st.tiktokUsername}/live`,
      canViewProfile,
    };
  });

  const secondsSincePoll = Math.max(
    0,
    Math.floor(
      (now.getTime() - new Date(data.settings.lastPolledAt).getTime()) / 1000
    )
  );

  return (
    <LiveRoomsClient
      rooms={rooms}
      initialSecondsAgo={Math.min(secondsSincePoll, 29)}
      minSessionMinutes={data.settings.minSessionMinutes}
    />
  );
}
