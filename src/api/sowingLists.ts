import { apiFetch } from './client';
import type { SowingList, SowingListItem } from '@/types';

export const getSowingLists = (projectId: string) =>
  apiFetch<SowingList[]>(`/sowing-lists?projectId=${projectId}`);

export const createSowingList = (body: { projectId: string; name?: string }) =>
  apiFetch<SowingList>('/sowing-lists', { method: 'POST', body: JSON.stringify(body) });

export const deleteSowingList = (id: string) =>
  apiFetch<void>(`/sowing-lists/${id}`, { method: 'DELETE' });

export const createSowingListItem = (
  listId: string,
  body: Omit<SowingListItem, 'id' | 'sowingListId'>
) =>
  apiFetch<SowingListItem>(`/sowing-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateSowingListItem = (
  listId: string,
  itemId: string,
  body: Partial<SowingListItem>
) =>
  apiFetch<SowingListItem>(`/sowing-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteSowingListItem = (listId: string, itemId: string) =>
  apiFetch<void>(`/sowing-lists/${listId}/items/${itemId}`, { method: 'DELETE' });
