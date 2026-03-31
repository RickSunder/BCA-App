'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getProjects, deleteProject } from '@/api/projects';
import type { Project } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success('Project deleted');
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = projects.filter(
    (p) =>
      p.projectId.toLowerCase().includes(search.toLowerCase()) ||
      (p.requestTitle ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (p.crop ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Convert a submitted request to create a project"
        />
      ) : (
        <Card>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Project ID', 'Title', 'Crop', 'Type', 'Stage', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-green-700">
                    <Link href={`/projects/${p.id}`} className="hover:underline">
                      {p.projectId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.requestTitle ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.crop ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.requestType ?? '—'}</td>
                  <td className="px-4 py-3"><Badge value={p.stage} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/projects/${p.id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                      <Button variant="danger" onClick={() => setConfirmDelete(p)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete project?"
        description={`Project ${confirmDelete?.projectId} and all its lists will be permanently deleted.`}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
