'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProjectRequests,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
  submitProjectRequest,
  convertProjectRequest,
} from '@/api/projectRequests';
import type { ProjectRequest } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectRequestForm from '@/components/forms/ProjectRequestForm';
import { z } from 'zod';
import { projectRequestSchema } from '@/lib/schemas';

type FormValues = z.infer<typeof projectRequestSchema>;

export default function ProjectRequestsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProjectRequest | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProjectRequest | null>(null);
  const [search, setSearch] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['project-requests'],
    queryFn: getProjectRequests,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['project-requests'] });

  const createMutation = useMutation({
    mutationFn: createProjectRequest,
    onSuccess: () => { toast.success('Request created'); setShowForm(false); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ProjectRequest> }) =>
      updateProjectRequest(id, body),
    onSuccess: () => { toast.success('Request updated'); setEditing(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjectRequest,
    onSuccess: () => { toast.success('Request deleted'); setConfirmDelete(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitMutation = useMutation({
    mutationFn: submitProjectRequest,
    onSuccess: () => { toast.success('Request submitted'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => convertProjectRequest(id),
    onSuccess: () => {
      toast.success('Converted to project');
      invalidate();
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard-counts'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = requests.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.crop.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitForm = async (data: FormValues) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, body: data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>New Request</Button>
      </div>

      {(showForm || editing) && (
        <Card className="p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {editing ? 'Edit Request' : 'New Request'}
          </h3>
          <ProjectRequestForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmitForm}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No project requests"
          description="Create your first request to get started"
          action={{ label: 'New Request', onClick: () => setShowForm(true) }}
        />
      ) : (
        <Card>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Crop', 'Type', 'Requested By', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.crop}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.requestType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.requestedBy}</td>
                  <td className="px-4 py-3"><Badge value={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {r.status === 'Draft' && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => { setEditing(r); setShowForm(false); }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => submitMutation.mutate(r.id)}
                            loading={submitMutation.isPending}
                          >
                            Submit
                          </Button>
                        </>
                      )}
                      {r.status === 'Submitted' && (
                        <Button
                          onClick={() => convertMutation.mutate(r.id)}
                          loading={convertMutation.isPending}
                        >
                          Convert
                        </Button>
                      )}
                      {r.status !== 'Converted' && (
                        <Button
                          variant="danger"
                          onClick={() => setConfirmDelete(r)}
                        >
                          Delete
                        </Button>
                      )}
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
        title="Delete request?"
        description={`"${confirmDelete?.title}" will be permanently deleted.`}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
