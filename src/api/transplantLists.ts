import { apiFetch } from './client';
import type { TransplantList, TransplantListItem } from '@/types';

export const getTransplantLists = (projectId: string) =>
  apiFetch<TransplantList[]>(`/transplant-lists?projectId=${projectId}`);

export const createTransplantList = (body: { projectId: string; name?: string }) =>
  apiFetch<TransplantList>('/transplant-lists', { method: 'POST', body: JSON.stringify(body) });

export const deleteTransplantList = (id: string) =>
  apiFetch<void>(`/transplant-lists/${id}`, { method: 'DELETE' });

export const createTransplantListItem = (
  listId: string,
  body: Omit<TransplantListItem, 'id' | 'transplantListId'>
) =>
  apiFetch<TransplantListItem>(`/transplant-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateTransplantListItem = (
  listId: string,
  itemId: string,
  body: Partial<TransplantListItem>
) =>
  apiFetch<TransplantListItem>(`/transplant-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteTransplantListItem = (listId: string, itemId: string) =>
  apiFetch<void>(`/transplant-lists/${listId}/items/${itemId}`, { method: 'DELETE' });
