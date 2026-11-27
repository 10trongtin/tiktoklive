import type { Metadata } from 'next';
import './globals.css';
import { UIProvider } from '@/components/ui/ToastProvider';
import { AppShell } from '@/components/shell/AppShell';

export const metadata: Metadata = {
  title:
    'PICITY LÊN LIVE — Hệ thống theo dõi livestream TikTok đội kinh doanh Picity',
  description:
    'Hệ thống theo dõi livestream TikTok đội kinh doanh Picity — Bảng xếp hạng, duyệt phiên live và báo cáo KPI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UIProvider>
          <AppShell>{children}</AppShell>
        </UIProvider>
      </body>
    </html>
  );
}
