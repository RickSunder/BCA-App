import { apiFetch } from './client';
import type { CrossingList, CrossingListItem } from '@/types';

export const getCrossingLists = (projectId: string) =>
  apiFetch<CrossingList[]>(`/crossing-lists?projectId=${projectId}`);

export const createCrossingList = (body: { projectId: string; name?: string }) =>
  apiFetch<CrossingList>('/crossing-lists', { method: 'POST', body: JSON.stringify(body) });

export const deleteCrossingList = (id: string) =>
  apiFetch<void>(`/crossing-lists/${id}`, { method: 'DELETE' });

export const createCrossingListItem = (
  listId: string,
  body: Omit<CrossingListItem, 'id' | 'crossingListId'>
) =>
  apiFetch<CrossingListItem>(`/crossing-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateCrossingListItem = (
  listId: string,
  itemId: string,
  body: Partial<CrossingListItem>
) =>
  apiFetch<CrossingListItem>(`/crossing-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteCrossingListItem = (listId: string, itemId: string) =>
  apiFetch<void>(`/crossing-lists/${listId}/items/${itemId}`, { method: 'DELETE' });
