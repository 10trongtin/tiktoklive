'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface LiveModalRoomData {
  sessionId: string;
  streamerId: string;
  streamerName: string;
  avatarInitials: string;
  tiktokUsername: string;
  title: string;
  projectName: string;
  currentViewers: number;
  liveMinutes: number;
  streamUrl: string;
}

interface UIContextValue {
  showToast: (message: string) => void;
  openLiveRoomModal: (room: LiveModalRoomData) => void;
  closeLiveRoomModal: () => void;
}

const UIContext = createContext<UIContextValue>({
  showToast: () => {},
  openLiveRoomModal: () => {},
  closeLiveRoomModal: () => {},
});

export function useUI() {
  return useContext(UIContext);
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [liveModalRoom, setLiveModalRoom] = useState<LiveModalRoomData | null>(
    null
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    // 04-giao-dien.md mục 5: Thông báo nổi hiện giữa đáy màn khoảng 3,4 giây
    timerRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const openLiveRoomModal = useCallback((room: LiveModalRoomData) => {
    setLiveModalRoom(room);
  }, []);

  const closeLiveRoomModal = useCallback(() => {
    setLiveModalRoom(null);
  }, []);

  return (
    <UIContext.Provider
      value={{ showToast, openLiveRoomModal, closeLiveRoomModal }}
    >
      {children}

      {toastMsg && (
        <div className="toast-container" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}

      {/* CN-02 Mục 4b: Hộp Xem phòng live dùng chung cho CN-01 & CN-02 */}
      {liveModalRoom && (
        <div
          className="modal-backdrop"
          onClick={closeLiveRoomModal}
          role="dialog"
          aria-modal="true"
          aria-label="Xem phòng live"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <span className="tag tag-live">● LIVE</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {liveModalRoom.tiktokUsername}
              </span>
            </div>

            <div className="person" style={{ marginBottom: 14 }}>
              <div className="avatar lg live-ring">
                {liveModalRoom.avatarInitials}
              </div>
              <div>
                <div className="person-name" style={{ fontSize: 17 }}>
                  {liveModalRoom.streamerName}
                </div>
                <div className="person-sub">
                  {liveModalRoom.title} · {liveModalRoom.projectName}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                marginBottom: 18,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {liveModalRoom.currentViewers} người xem · đã live{' '}
                {liveModalRoom.liveMinutes} phút
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <a
                href={
                  liveModalRoom.streamUrl ||
                  `https://www.tiktok.com/${liveModalRoom.tiktokUsername}/live`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Mở trên TikTok ↗
              </a>
              <button
                type="button"
                className="btn"
                onClick={closeLiveRoomModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
