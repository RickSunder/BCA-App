import { apiFetch } from './client';
import type { Project, DashboardCounts } from '@/types';

export const getProjects = () => apiFetch<Project[]>('/projects');

export const getProject = (id: string) => apiFetch<Project>(`/projects/${id}`);

export const updateProject = (id: string, body: Partial<Project>) =>
  apiFetch<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteProject = (id: string) =>
  apiFetch<void>(`/projects/${id}`, { method: 'DELETE' });

export const getDashboardCounts = () => apiFetch<DashboardCounts>('/projects/counts');
