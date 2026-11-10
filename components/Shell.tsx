'use client';

import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import FloatingShapes from './FloatingShapes';
import ServiceWorker from './ServiceWorker';

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideBar = path === '/';
  return (
    <>
      <ServiceWorker />
      <FloatingShapes />
      <div className="relative z-10 min-h-screen px-4 pb-16">
        {hideBar ? null : <TopBar />}
        <main className="mx-auto max-w-5xl pt-4">{children}</main>
      </div>
    </>
  );
}
