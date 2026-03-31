import { apiFetch } from './client';
import type { ProjectRequest, Project } from '@/types';

export const getProjectRequests = () =>
  apiFetch<ProjectRequest[]>('/project-requests');

export const getProjectRequest = (id: string) =>
  apiFetch<ProjectRequest>(`/project-requests/${id}`);

export const createProjectRequest = (body: Partial<ProjectRequest>) =>
  apiFetch<ProjectRequest>('/project-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateProjectRequest = (id: string, body: Partial<ProjectRequest>) =>
  apiFetch<ProjectRequest>(`/project-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteProjectRequest = (id: string) =>
  apiFetch<void>(`/project-requests/${id}`, { method: 'DELETE' });

export const submitProjectRequest = (id: string) =>
  apiFetch<ProjectRequest>(`/project-requests/${id}/submit`, { method: 'POST' });

export const convertProjectRequest = (id: string, owner?: string) =>
  apiFetch<{ projectRequest: ProjectRequest; project: Project }>(
    `/project-requests/${id}/convert`,
    { method: 'POST', body: JSON.stringify({ owner }) }
  );
