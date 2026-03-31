'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getDashboardCounts } from '@/api/projects';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: getDashboardCounts,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const cards = [
    { label: 'Project Requests', count: data?.projectRequests ?? 0, href: '/project-requests' },
    { label: 'Projects', count: data?.projects ?? 0, href: '/projects' },
  ];

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ label, count, href }) => (
          <Link key={href} href={href}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{count}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
