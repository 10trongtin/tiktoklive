'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthSessionUser } from '@/types/domain';
import {
  getMobileBottomNavItems,
  getVisibleNavItems,
  MenuGroup,
  NAV_ITEMS,
} from '@/lib/permissions';
import { formatSecondsAgoText } from '@/lib/formatters';
import { useUI } from '@/components/ui/ToastProvider';
import { clearBellUnreadAction, signOutAction } from '@/app/actions/auth';

export interface ShellSummaryProps {
  user: AuthSessionUser | null;
  seasonName: string;
  streamerCount: number;
  teamCount: number;
  projectCount: number;
  liveCount: number;
  pendingSessionsCount: number;
  pendingRegistrationsCount: number;
  providerName: string;
  connectionOnline: boolean;
  initialSecondsAgo: number;
  unreadBellCount: number;
  bellToastMessage: string;
  children: React.ReactNode;
}

const GROUPS: MenuGroup[] = ['Tổng quan', 'Streamer', 'Quản trị'];

export function AppShellClient({
  user,
  seasonName,
  streamerCount,
  teamCount,
  projectCount,
  liveCount,
  pendingSessionsCount,
  pendingRegistrationsCount,
  providerName,
  connectionOnline,
  initialSecondsAgo,
  unreadBellCount,
  bellToastMessage,
  children,
}: ShellSummaryProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useUI();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [secondsAgo, setSecondsAgo] = useState(Math.max(1, initialSecondsAgo));
  const [bellUnread, setBellUnread] = useState(unreadBellCount);

  useEffect(() => {
    setBellUnread(unreadBellCount);
  }, [unreadBellCount]);

  useEffect(() => {
    setSecondsAgo(Math.max(1, initialSecondsAgo));
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [initialSecondsAgo]);

  // Trang Đăng nhập hiển thị độc lập không bọc khung điều hướng
  if (pathname === '/dang-nhap') {
    return <>{children}</>;
  }

  const visibleItems = getVisibleNavItems(user?.role ?? null);
  const mobileItems = getMobileBottomNavItems(user?.role ?? null);
  const currentNav =
    NAV_ITEMS.find((item) => item.href === pathname) ?? NAV_ITEMS[0];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      if (user?.role === 'admin') {
        showToast(`Kết quả tìm “${q}” trong Quản lý streamer.`);
        router.push(`/quan-ly-streamer?q=${encodeURIComponent(q)}`);
      }
    }
  };

  const handleBellClick = async () => {
    showToast(bellToastMessage);
    setBellUnread(0);
    await clearBellUnreadAction();
  };

  const renderBadge = (
    badgeType?: 'live' | 'pending_sessions' | 'pending_registrations'
  ) => {
    if (badgeType === 'live' && liveCount > 0) {
      return <span className="nav-badge live">{liveCount}</span>;
    }
    if (badgeType === 'pending_sessions' && pendingSessionsCount > 0) {
      return <span className="nav-badge">{pendingSessionsCount}</span>;
    }
    if (
      badgeType === 'pending_registrations' &&
      pendingRegistrationsCount > 0
    ) {
      return <span className="nav-badge">{pendingRegistrationsCount}</span>;
    }
    return null;
  };

  return (
    <div className="app-layout">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-row">
            <div className="brand-logo">P</div>
            <div>
              <div className="brand-title">
                PICITY <span>LÊN LIVE</span>
              </div>
            </div>
          </div>
          <div className="brand-sub">
            Hệ thống theo dõi livestream TikTok đội kinh doanh Picity
          </div>
        </div>

        <div className="sidebar-season">
          <div className="sidebar-season-label">Mùa giải hiện tại</div>
          <div className="sidebar-season-name">{seasonName}</div>
          <div className="sidebar-season-meta">
            {streamerCount} streamer · {teamCount} team · {projectCount} dự án
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Menu chính">
          {GROUPS.map((group) => {
            const items = visibleItems.filter((i) => i.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="nav-group-label">{group}</div>
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.code}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setSidebarOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <span>{item.sidebarLabel}</span>
                      {renderBadge(item.badgeType)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user">
              <div className="avatar">{user.avatarInitials}</div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.fullName}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(248, 250, 252, 0.7)',
                  }}
                >
                  {user.sidebarRoleTitle}
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="btn btn-gold"
              style={{ width: '100%' }}
            >
              Đăng nhập hệ thống
            </Link>
          )}

          <div className="sidebar-conn">
            <span
              className={`conn-dot ${connectionOnline ? '' : 'offline'}`}
            />
            <span>
              {providerName} đã kết nối · {formatSecondsAgoText(secondsAgo, false)}
            </span>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="btn btn-sm mobile-menu-btn"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              ☰ Menu
            </button>
            <div className="breadcrumb">
              Picity Lên Live / <strong>{currentNav.sidebarLabel}</strong>
            </div>
          </div>

          <div className="topbar-right">
            {user?.role === 'admin' && (
              <div className="topbar-search">
                <input
                  type="search"
                  className="input"
                  placeholder="Tìm streamer, @TikTok, team…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
            )}

            <div className="live-pill">
              <span className="blink-dot" />
              <span>{liveCount} đang live</span>
            </div>

            {user && (
              <button
                type="button"
                className="bell-btn"
                onClick={handleBellClick}
                aria-label="Thông báo"
              >
                🔔
                {bellUnread > 0 && (
                  <span className="bell-count">{bellUnread}</span>
                )}
              </button>
            )}

            {user ? (
              <div className="topbar-user">
                <div className="avatar">{user.avatarInitials}</div>
                <div className="topbar-user-text">
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {user.roleTitle}
                  </div>
                </div>
                <form action={signOutAction}>
                  <button type="submit" className="btn btn-sm" title="Đăng xuất">
                    Thoát
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/dang-nhap" className="btn btn-primary btn-sm">
                Đăng nhập
              </Link>
            )}
          </div>
        </header>

        <main className="content-wrap">{children}</main>

        {mobileItems.length > 0 && (
          <nav className="mobile-bottom-nav" aria-label="Menu dưới điện thoại">
            {mobileItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.code}
                  href={item.href}
                  className={`mobile-bottom-link ${isActive ? 'active' : ''}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span>{item.mobileBottomLabel}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
