import { apiFetch } from './client';
import type { SelfingList, SelfingListItem } from '@/types';

export const getSelfingLists = (projectId: string) =>
  apiFetch<SelfingList[]>(`/selfing-lists?projectId=${projectId}`);

export const createSelfingList = (body: { projectId: string; name?: string }) =>
  apiFetch<SelfingList>('/selfing-lists', { method: 'POST', body: JSON.stringify(body) });

export const deleteSelfingList = (id: string) =>
  apiFetch<void>(`/selfing-lists/${id}`, { method: 'DELETE' });

export const createSelfingListItem = (
  listId: string,
  body: Omit<SelfingListItem, 'id' | 'selfingListId'>
) =>
  apiFetch<SelfingListItem>(`/selfing-lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateSelfingListItem = (
  listId: string,
  itemId: string,
  body: Partial<SelfingListItem>
) =>
  apiFetch<SelfingListItem>(`/selfing-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteSelfingListItem = (listId: string, itemId: string) =>
  apiFetch<void>(`/selfing-lists/${listId}/items/${itemId}`, { method: 'DELETE' });
