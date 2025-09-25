'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

const NO_PADDING_ROUTES = [
  '/',         // 루트
];
const NO_BG_ROUTES      = ['/cesium','/prod','/similarity','map'];

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // NO_PADDING_ROUTES에 있으면 padding 없애고, 아니면 pt-16
  const shouldPad = !NO_PADDING_ROUTES.includes(pathname);
  const shouldBg  = !NO_BG_ROUTES.includes(pathname);

  return (
    <main className={`
      ${shouldPad ? 'pt-16' : ''}
      ${shouldBg  ? 'bg-green-100' : ''}
    `}>
      {children}
    </main>
  );
}
