'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/project-requests': 'Project Requests',
  '/projects': 'Projects',
};

export default function TopHeader() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    (pathname.startsWith('/projects/') ? 'Project Detail' : 'BCA Admin');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
