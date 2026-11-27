import { ExternalRoomSnapshot } from '@/lib/repository';

export interface LiveTrackingProvider {
  name: string;
  fetchRoomsStatus(tiktokUsernames: string[]): Promise<ExternalRoomSnapshot[]>;
}

/**
 * Adapter kết nối tới dịch vụ đọc phòng live TikTok bên thứ ba (CN-12 & CH-00).
 * Khi cấu hình LIVE_PROVIDER_API_URL + LIVE_PROVIDER_API_KEY trong môi trường,
 * hệ thống gọi HTTP endpoint của nhà cung cấp để lấy trạng thái phát thực tế.
 */
export function createLiveTrackingProvider(): LiveTrackingProvider {
  const name = process.env.LIVE_PROVIDER_NAME?.trim() || 'TikTok Live Service';
  const apiUrl = process.env.LIVE_PROVIDER_API_URL?.trim();
  const apiKey = process.env.LIVE_PROVIDER_API_KEY?.trim();

  return {
    name,
    async fetchRoomsStatus(
      tiktokUsernames: string[]
    ): Promise<ExternalRoomSnapshot[]> {
      if (!apiUrl || tiktokUsernames.length === 0) {
        return [];
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ usernames: tiktokUsernames }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Live provider HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        rooms?: ExternalRoomSnapshot[];
      };
      return payload.rooms ?? [];
    },
  };
}
