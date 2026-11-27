import React from 'react';
import { getCurrentSessionUser } from '@/lib/auth';
import { getActiveSeason, getAllAppData } from '@/lib/repository';
import { getVietnamWeekBounds } from '@/lib/formatters';
import { AppShellClient } from '@/components/shell/AppShellClient';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [user, data] = await Promise.all([
    getCurrentSessionUser(),
    getAllAppData(),
  ]);

  const now = new Date();
  const activeSeason = getActiveSeason(data.seasons);
  const weekBounds = getVietnamWeekBounds(now);
  const seasonName = activeSeason ? activeSeason.name : weekBounds.label;

  const activeStreamers = data.streamers.filter((s) => s.active);
  const liveCount = data.liveSessions.filter(
    (s) => s.reviewStatus === 'dang_live'
  ).length;
  const pendingSessionsCount = data.liveSessions.filter(
    (s) => s.reviewStatus === 'cho_duyet' || s.reviewStatus === 'cho_duyet_tay'
  ).length;
  const pendingRegistrationsCount = data.registrations.filter(
    (r) => r.status === 'cho_duyet'
  ).length;

  const secondsSincePoll = Math.max(
    1,
    Math.floor(
      (now.getTime() - new Date(data.settings.lastPolledAt).getTime()) / 1000
    )
  );

  // Lọc thông báo chưa đọc theo vai trò người đăng nhập
  const relevantUnread = user
    ? data.notifications.filter((n) => {
        if (n.isRead) return false;
        if (user.role === 'streamer') {
          return n.recipientStreamerId === user.streamerId;
        }
        return n.recipientRole === user.role;
      })
    : [];

  let bellToastMessage = 'Không có thông báo mới.';
  if (user?.role === 'admin') {
    const parts: string[] = [];
    if (pendingSessionsCount > 0) {
      parts.push(`${pendingSessionsCount} phiên chờ duyệt`);
    }
    if (pendingRegistrationsCount > 0) {
      parts.push(`${pendingRegistrationsCount} đăng ký chờ duyệt`);
    }
    if (relevantUnread[0]) {
      parts.push(relevantUnread[0].message);
    }
    const totalCount =
      relevantUnread.length +
      (pendingSessionsCount > 0 ? 1 : 0) +
      (pendingRegistrationsCount > 0 ? 1 : 0);
    if (parts.length > 0) {
      bellToastMessage = `${totalCount} thông báo mới: ${parts.join(' · ')}.`;
    }
  } else if (relevantUnread.length > 0) {
    bellToastMessage = `${relevantUnread.length} thông báo mới: ${relevantUnread
      .slice(0, 3)
      .map((n) => n.message)
      .join(' · ')}.`;
  }

  const badgeCount =
    user?.role === 'admin'
      ? relevantUnread.length +
        (pendingSessionsCount > 0 ? 1 : 0) +
        (pendingRegistrationsCount > 0 ? 1 : 0)
      : relevantUnread.length;

  return (
    <AppShellClient
      user={user}
      seasonName={seasonName}
      streamerCount={activeStreamers.length}
      teamCount={data.teams.length}
      projectCount={data.projects.length}
      liveCount={liveCount}
      pendingSessionsCount={pendingSessionsCount}
      pendingRegistrationsCount={pendingRegistrationsCount}
      providerName={data.settings.providerName}
      connectionOnline={data.settings.connectionStatus === 'connected'}
      initialSecondsAgo={Math.min(secondsSincePoll, 59)}
      unreadBellCount={badgeCount}
      bellToastMessage={bellToastMessage}
    >
      {children}
    </AppShellClient>
  );
}
