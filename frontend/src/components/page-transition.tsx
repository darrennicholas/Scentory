'use client';

import { usePathname } from 'next/navigation';

const modules = ['perfumes', 'notes', 'collections', 'reviews', 'wishlist', 'insights'] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const moduleName = modules.find(module => pathname === `/${module}` || pathname.startsWith(`/${module}/`)) ?? 'home';

  return <div key={pathname} className={`route-transition route-transition--${moduleName}`}>{children}</div>;
}
