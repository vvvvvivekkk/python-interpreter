import type { Metadata, Viewport } from 'next';
import './globals.css';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: 'Python Fun World',
  description: 'A magical place where a 5-year-old learns Python with Pixi the robot!',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#FF6B9D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
