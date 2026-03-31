'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProject, updateProject } from '@/api/projects';
import {
  getSowingLists, createSowingList, deleteSowingList,
  createSowingListItem, updateSowingListItem, deleteSowingListItem,
} from '@/api/sowingLists';
import {
  getCrossingLists, createCrossingList, deleteCrossingList,
  createCrossingListItem, updateCrossingListItem, deleteCrossingListItem,
} from '@/api/crossingLists';
import {
  getTransplantLists, createTransplantList, deleteTransplantList,
  createTransplantListItem, updateTransplantListItem, deleteTransplantListItem,
} from '@/api/transplantLists';
import {
  getSelfingLists, createSelfingList, deleteSelfingList,
  createSelfingListItem, updateSelfingListItem, deleteSelfingListItem,
} from '@/api/selfingLists';
import type {
  SowingList, SowingListItem,
  CrossingList, CrossingListItem,
  TransplantList, TransplantListItem,
  SelfingList, SelfingListItem,
} from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectForm from '@/components/forms/ProjectForm';
import { z } from 'zod';
import { projectSchema } from '@/lib/schemas';

type ProjectFormValues = z.infer<typeof projectSchema>;

type Tab = 'Sowing' | 'Crossing' | 'Transplant' | 'Selfing';
const TABS: Tab[] = ['Sowing', 'Crossing', 'Transplant', 'Selfing'];

// ── Sowing Tab ────────────────────────────────────────────────
function SowingTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const qk = ['sowing-lists', projectId];
  const { data: lists = [], isLoading } = useQuery({ queryKey: qk, queryFn: () => getSowingLists(projectId) });

  const [confirmDeleteList, setConfirmDeleteList] = useState<SowingList | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ listId: string; item: SowingListItem } | null>(null);
  const [addingItemListId, setAddingItemListId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ material: '', quantity: 0, location: '' });
  const [editingItem, setEditingItem] = useState<{ listId: string; item: SowingListItem } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: qk });

  const createListMut = useMutation({
    mutationFn: () => createSowingList({ projectId }),
    onSuccess: () => { toast.success('List created'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteListMut = useMutation({
    mutationFn: deleteSowingList,
    onSuccess: () => { toast.success('List deleted'); setConfirmDeleteList(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const createItemMut = useMutation({
    mutationFn: ({ listId, body }: { listId: string; body: Omit<SowingListItem, 'id' | 'sowingListId'> }) =>
      createSowingListItem(listId, body),
    onSuccess: () => { toast.success('Item added'); setAddingItemListId(null); setNewItem({ material: '', quantity: 0, location: '' }); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateItemMut = useMutation({
    mutationFn: ({ listId, itemId, body }: { listId: string; itemId: string; body: Partial<SowingListItem> }) =>
      updateSowingListItem(listId, itemId, body),
    onSuccess: () => { toast.success('Item updated'); setEditingItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteItemMut = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      deleteSowingListItem(listId, itemId),
    onSuccess: () => { toast.success('Item deleted'); setConfirmDeleteItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => createListMut.mutate()} loading={createListMut.isPending}>
          + New Sowing List
        </Button>
      </div>
      {lists.length === 0 ? (
        <EmptyState title="No sowing lists" description="Add a sowing list to get started" />
      ) : (
        lists.map((list) => (
          <Card key={list.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-medium text-sm text-gray-800">{list.name || 'Untitled List'}</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setAddingItemListId(list.id); }}>+ Item</Button>
                <Button variant="danger" onClick={() => setConfirmDeleteList(list)}>Delete</Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  {['Material', 'Quantity', 'Location', ''].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {addingItemListId === list.id && (
                  <tr className="bg-green-50">
                    <td className="px-4 py-2">
                      <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Material" value={newItem.material} onChange={(e) => setNewItem({ ...newItem, material: e.target.value })} />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" className="border rounded px-2 py-1 text-sm w-20" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: +e.target.value })} />
                    </td>
                    <td className="px-4 py-2">
                      <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button onClick={() => createItemMut.mutate({ listId: list.id, body: newItem })} loading={createItemMut.isPending}>Save</Button>
                        <Button variant="secondary" onClick={() => setAddingItemListId(null)}>Cancel</Button>
                      </div>
                    </td>
                  </tr>
                )}
                {list.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {editingItem?.item.id === item.id ? (
                      <>
                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.material} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, material: e.target.value } })} /></td>
                        <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" defaultValue={item.quantity} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, quantity: +e.target.value } })} /></td>
                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.location} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, location: e.target.value } })} /></td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Button onClick={() => updateItemMut.mutate({ listId: editingItem.listId, itemId: item.id, body: editingItem.item })} loading={updateItemMut.isPending}>Save</Button>
                            <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm">{item.material}</td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm">{item.location}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setEditingItem({ listId: list.id, item })}>Edit</Button>
                            <Button variant="danger" onClick={() => setConfirmDeleteItem({ listId: list.id, item })}>Delete</Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {list.items.length === 0 && addingItemListId !== list.id && (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-400">No items</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        ))
      )}

      <ConfirmDialog
        open={!!confirmDeleteList}
        title="Delete list?"
        description="All items in this list will also be deleted."
        onConfirm={() => confirmDeleteList && deleteListMut.mutate(confirmDeleteList.id)}
        onCancel={() => setConfirmDeleteList(null)}
        loading={deleteListMut.isPending}
      />
      <ConfirmDialog
        open={!!confirmDeleteItem}
        title="Delete item?"
        onConfirm={() => confirmDeleteItem && deleteItemMut.mutate({ listId: confirmDeleteItem.listId, itemId: confirmDeleteItem.item.id })}
        onCancel={() => setConfirmDeleteItem(null)}
        loading={deleteItemMut.isPending}
      />
    </div>
  );
}

// ── Crossing Tab ──────────────────────────────────────────────
function CrossingTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const qk = ['crossing-lists', projectId];
  const { data: lists = [], isLoading } = useQuery({ queryKey: qk, queryFn: () => getCrossingLists(projectId) });

  const [confirmDeleteList, setConfirmDeleteList] = useState<CrossingList | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ listId: string; item: CrossingListItem } | null>(null);
  const [addingItemListId, setAddingItemListId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ female: '', male: '', plannedCount: 0 });
  const [editingItem, setEditingItem] = useState<{ listId: string; item: CrossingListItem } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: qk });

  const createListMut = useMutation({
    mutationFn: () => createCrossingList({ projectId }),
    onSuccess: () => { toast.success('List created'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteListMut = useMutation({
    mutationFn: deleteCrossingList,
    onSuccess: () => { toast.success('List deleted'); setConfirmDeleteList(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const createItemMut = useMutation({
    mutationFn: ({ listId, body }: { listId: string; body: Omit<CrossingListItem, 'id' | 'crossingListId'> }) =>
      createCrossingListItem(listId, body),
    onSuccess: () => { toast.success('Item added'); setAddingItemListId(null); setNewItem({ female: '', male: '', plannedCount: 0 }); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateItemMut = useMutation({
    mutationFn: ({ listId, itemId, body }: { listId: string; itemId: string; body: Partial<CrossingListItem> }) =>
      updateCrossingListItem(listId, itemId, body),
    onSuccess: () => { toast.success('Item updated'); setEditingItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteItemMut = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      deleteCrossingListItem(listId, itemId),
    onSuccess: () => { toast.success('Item deleted'); setConfirmDeleteItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => createListMut.mutate()} loading={createListMut.isPending}>+ New Crossing List</Button>
      </div>
      {lists.length === 0 ? (
        <EmptyState title="No crossing lists" />
      ) : (
        lists.map((list) => (
          <Card key={list.id} className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-medium text-sm text-gray-800">{list.name || 'Untitled List'}</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setAddingItemListId(list.id)}>+ Item</Button>
                <Button variant="danger" onClick={() => setConfirmDeleteList(list)}>Delete</Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-white">
                <tr>
                  {['Female', 'Male', 'Planned Count', ''].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {addingItemListId === list.id && (
                  <tr className="bg-green-50">
                    <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" placeholder="Female" value={newItem.female} onChange={(e) => setNewItem({ ...newItem, female: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" placeholder="Male" value={newItem.male} onChange={(e) => setNewItem({ ...newItem, male: e.target.value })} /></td>
                    <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" value={newItem.plannedCount} onChange={(e) => setNewItem({ ...newItem, plannedCount: +e.target.value })} /></td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button onClick={() => createItemMut.mutate({ listId: list.id, body: newItem })} loading={createItemMut.isPending}>Save</Button>
                        <Button variant="secondary" onClick={() => setAddingItemListId(null)}>Cancel</Button>
                      </div>
                    </td>
                  </tr>
                )}
                {list.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {editingItem?.item.id === item.id ? (
                      <>
                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.female} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, female: e.target.value } })} /></td>
                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.male} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, male: e.target.value } })} /></td>
                        <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" defaultValue={item.plannedCount} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, plannedCount: +e.target.value } })} /></td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <Button onClick={() => updateItemMut.mutate({ listId: editingItem.listId, itemId: item.id, body: editingItem.item })} loading={updateItemMut.isPending}>Save</Button>
                            <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm">{item.female}</td>
                        <td className="px-4 py-2 text-sm">{item.male}</td>
                        <td className="px-4 py-2 text-sm">{item.plannedCount}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setEditingItem({ listId: list.id, item })}>Edit</Button>
                            <Button variant="danger" onClick={() => setConfirmDeleteItem({ listId: list.id, item })}>Delete</Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {list.items.length === 0 && addingItemListId !== list.id && (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-400">No items</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        ))
      )}
      <ConfirmDialog open={!!confirmDeleteList} title="Delete list?" description="All items will also be deleted." onConfirm={() => confirmDeleteList && deleteListMut.mutate(confirmDeleteList.id)} onCancel={() => setConfirmDeleteList(null)} loading={deleteListMut.isPending} />
      <ConfirmDialog open={!!confirmDeleteItem} title="Delete item?" onConfirm={() => confirmDeleteItem && deleteItemMut.mutate({ listId: confirmDeleteItem.listId, itemId: confirmDeleteItem.item.id })} onCancel={() => setConfirmDeleteItem(null)} loading={deleteItemMut.isPending} />
    </div>
  );
}

// ── Transplant Tab ────────────────────────────────────────────
function TransplantTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const qk = ['transplant-lists', projectId];
  const { data: lists = [], isLoading } = useQuery({ queryKey: qk, queryFn: () => getTransplantLists(projectId) });

  const [confirmDeleteList, setConfirmDeleteList] = useState<TransplantList | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ listId: string; item: TransplantListItem } | null>(null);
  const [addingItemListId, setAddingItemListId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ fromLocation: '', toLocation: '', count: 0 });
  const [editingItem, setEditingItem] = useState<{ listId: string; item: TransplantListItem } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: qk });

  const createListMut = useMutation({ mutationFn: () => createTransplantList({ projectId }), onSuccess: () => { toast.success('List created'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const deleteListMut = useMutation({ mutationFn: deleteTransplantList, onSuccess: () => { toast.success('List deleted'); setConfirmDeleteList(null); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const createItemMut = useMutation({
    mutationFn: ({ listId, body }: { listId: string; body: Omit<TransplantListItem, 'id' | 'transplantListId'> }) => createTransplantListItem(listId, body),
    onSuccess: () => { toast.success('Item added'); setAddingItemListId(null); setNewItem({ fromLocation: '', toLocation: '', count: 0 }); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateItemMut = useMutation({
    mutationFn: ({ listId, itemId, body }: { listId: string; itemId: string; body: Partial<TransplantListItem> }) => updateTransplantListItem(listId, itemId, body),
    onSuccess: () => { toast.success('Item updated'); setEditingItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteItemMut = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => deleteTransplantListItem(listId, itemId),
    onSuccess: () => { toast.success('Item deleted'); setConfirmDeleteItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => createListMut.mutate()} loading={createListMut.isPending}>+ New Transplant List</Button>
      </div>
      {lists.length === 0 ? <EmptyState title="No transplant lists" /> : lists.map((list) => (
        <Card key={list.id} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="font-medium text-sm text-gray-800">{list.name || 'Untitled List'}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAddingItemListId(list.id)}>+ Item</Button>
              <Button variant="danger" onClick={() => setConfirmDeleteList(list)}>Delete</Button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>{['From', 'To', 'Count', ''].map((h) => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {addingItemListId === list.id && (
                <tr className="bg-green-50">
                  <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" placeholder="From" value={newItem.fromLocation} onChange={(e) => setNewItem({ ...newItem, fromLocation: e.target.value })} /></td>
                  <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" placeholder="To" value={newItem.toLocation} onChange={(e) => setNewItem({ ...newItem, toLocation: e.target.value })} /></td>
                  <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" value={newItem.count} onChange={(e) => setNewItem({ ...newItem, count: +e.target.value })} /></td>
                  <td className="px-4 py-2"><div className="flex gap-2"><Button onClick={() => createItemMut.mutate({ listId: list.id, body: newItem })} loading={createItemMut.isPending}>Save</Button><Button variant="secondary" onClick={() => setAddingItemListId(null)}>Cancel</Button></div></td>
                </tr>
              )}
              {list.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingItem?.item.id === item.id ? (
                    <>
                      <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.fromLocation} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, fromLocation: e.target.value } })} /></td>
                      <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.toLocation} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, toLocation: e.target.value } })} /></td>
                      <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" defaultValue={item.count} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, count: +e.target.value } })} /></td>
                      <td className="px-4 py-2"><div className="flex gap-2"><Button onClick={() => updateItemMut.mutate({ listId: editingItem.listId, itemId: item.id, body: editingItem.item })} loading={updateItemMut.isPending}>Save</Button><Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-sm">{item.fromLocation}</td>
                      <td className="px-4 py-2 text-sm">{item.toLocation}</td>
                      <td className="px-4 py-2 text-sm">{item.count}</td>
                      <td className="px-4 py-2"><div className="flex gap-2 justify-end"><Button variant="secondary" onClick={() => setEditingItem({ listId: list.id, item })}>Edit</Button><Button variant="danger" onClick={() => setConfirmDeleteItem({ listId: list.id, item })}>Delete</Button></div></td>
                    </>
                  )}
                </tr>
              ))}
              {list.items.length === 0 && addingItemListId !== list.id && <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-400">No items</td></tr>}
            </tbody>
          </table>
        </Card>
      ))}
      <ConfirmDialog open={!!confirmDeleteList} title="Delete list?" description="All items will also be deleted." onConfirm={() => confirmDeleteList && deleteListMut.mutate(confirmDeleteList.id)} onCancel={() => setConfirmDeleteList(null)} loading={deleteListMut.isPending} />
      <ConfirmDialog open={!!confirmDeleteItem} title="Delete item?" onConfirm={() => confirmDeleteItem && deleteItemMut.mutate({ listId: confirmDeleteItem.listId, itemId: confirmDeleteItem.item.id })} onCancel={() => setConfirmDeleteItem(null)} loading={deleteItemMut.isPending} />
    </div>
  );
}

// ── Selfing Tab ───────────────────────────────────────────────
function SelfingTab({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const qk = ['selfing-lists', projectId];
  const { data: lists = [], isLoading } = useQuery({ queryKey: qk, queryFn: () => getSelfingLists(projectId) });

  const [confirmDeleteList, setConfirmDeleteList] = useState<SelfingList | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{ listId: string; item: SelfingListItem } | null>(null);
  const [addingItemListId, setAddingItemListId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ plant: '', plannedCount: 0 });
  const [editingItem, setEditingItem] = useState<{ listId: string; item: SelfingListItem } | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: qk });

  const createListMut = useMutation({ mutationFn: () => createSelfingList({ projectId }), onSuccess: () => { toast.success('List created'); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const deleteListMut = useMutation({ mutationFn: deleteSelfingList, onSuccess: () => { toast.success('List deleted'); setConfirmDeleteList(null); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const createItemMut = useMutation({
    mutationFn: ({ listId, body }: { listId: string; body: Omit<SelfingListItem, 'id' | 'selfingListId'> }) => createSelfingListItem(listId, body),
    onSuccess: () => { toast.success('Item added'); setAddingItemListId(null); setNewItem({ plant: '', plannedCount: 0 }); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateItemMut = useMutation({
    mutationFn: ({ listId, itemId, body }: { listId: string; itemId: string; body: Partial<SelfingListItem> }) => updateSelfingListItem(listId, itemId, body),
    onSuccess: () => { toast.success('Item updated'); setEditingItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteItemMut = useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) => deleteSelfingListItem(listId, itemId),
    onSuccess: () => { toast.success('Item deleted'); setConfirmDeleteItem(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => createListMut.mutate()} loading={createListMut.isPending}>+ New Selfing List</Button>
      </div>
      {lists.length === 0 ? <EmptyState title="No selfing lists" /> : lists.map((list) => (
        <Card key={list.id} className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="font-medium text-sm text-gray-800">{list.name || 'Untitled List'}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAddingItemListId(list.id)}>+ Item</Button>
              <Button variant="danger" onClick={() => setConfirmDeleteList(list)}>Delete</Button>
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>{['Plant', 'Planned Count', ''].map((h) => <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {addingItemListId === list.id && (
                <tr className="bg-green-50">
                  <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" placeholder="Plant" value={newItem.plant} onChange={(e) => setNewItem({ ...newItem, plant: e.target.value })} /></td>
                  <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" value={newItem.plannedCount} onChange={(e) => setNewItem({ ...newItem, plannedCount: +e.target.value })} /></td>
                  <td className="px-4 py-2"><div className="flex gap-2"><Button onClick={() => createItemMut.mutate({ listId: list.id, body: newItem })} loading={createItemMut.isPending}>Save</Button><Button variant="secondary" onClick={() => setAddingItemListId(null)}>Cancel</Button></div></td>
                </tr>
              )}
              {list.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {editingItem?.item.id === item.id ? (
                    <>
                      <td className="px-4 py-2"><input className="border rounded px-2 py-1 text-sm w-full" defaultValue={item.plant} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, plant: e.target.value } })} /></td>
                      <td className="px-4 py-2"><input type="number" className="border rounded px-2 py-1 text-sm w-20" defaultValue={item.plannedCount} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, plannedCount: +e.target.value } })} /></td>
                      <td className="px-4 py-2"><div className="flex gap-2"><Button onClick={() => updateItemMut.mutate({ listId: editingItem.listId, itemId: item.id, body: editingItem.item })} loading={updateItemMut.isPending}>Save</Button><Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-sm">{item.plant}</td>
                      <td className="px-4 py-2 text-sm">{item.plannedCount}</td>
                      <td className="px-4 py-2"><div className="flex gap-2 justify-end"><Button variant="secondary" onClick={() => setEditingItem({ listId: list.id, item })}>Edit</Button><Button variant="danger" onClick={() => setConfirmDeleteItem({ listId: list.id, item })}>Delete</Button></div></td>
                    </>
                  )}
                </tr>
              ))}
              {list.items.length === 0 && addingItemListId !== list.id && <tr><td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-400">No items</td></tr>}
            </tbody>
          </table>
        </Card>
      ))}
      <ConfirmDialog open={!!confirmDeleteList} title="Delete list?" description="All items will also be deleted." onConfirm={() => confirmDeleteList && deleteListMut.mutate(confirmDeleteList.id)} onCancel={() => setConfirmDeleteList(null)} loading={deleteListMut.isPending} />
      <ConfirmDialog open={!!confirmDeleteItem} title="Delete item?" onConfirm={() => confirmDeleteItem && deleteItemMut.mutate({ listId: confirmDeleteItem.listId, itemId: confirmDeleteItem.item.id })} onCancel={() => setConfirmDeleteItem(null)} loading={deleteItemMut.isPending} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('Sowing');
  const [editingProject, setEditingProject] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });

  const updateMut = useMutation({
    mutationFn: (body: Partial<typeof project>) => updateProject(id, body!),
    onSuccess: () => {
      toast.success('Project updated');
      setEditingProject(false);
      qc.invalidateQueries({ queryKey: ['project', id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !project) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="max-w-5xl">
      {/* Project header */}
      <Card className="p-6 mb-6">
        {editingProject ? (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h2>
            <ProjectForm
              defaultValues={project}
              onSubmit={async (data: ProjectFormValues) => { await updateMut.mutateAsync(data); }}
              onCancel={() => setEditingProject(false)}
              loading={updateMut.isPending}
            />
          </>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono text-green-700">{project.projectId}</span>
                <Badge value={project.stage} />
              </div>
              {project.requestTitle && (
                <p className="text-sm text-gray-600">{project.requestTitle}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500 mt-2">
                {project.crop && <span>Crop: <strong>{project.crop}</strong></span>}
                {project.requestType && <span>Type: <strong>{project.requestType}</strong></span>}
                {project.owner && <span>Owner: <strong>{project.owner}</strong></span>}
              </div>
            </div>
            <Button variant="secondary" onClick={() => setEditingProject(true)}>Edit</Button>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Sowing' && <SowingTab projectId={id} />}
      {activeTab === 'Crossing' && <CrossingTab projectId={id} />}
      {activeTab === 'Transplant' && <TransplantTab projectId={id} />}
      {activeTab === 'Selfing' && <SelfingTab projectId={id} />}
    </div>
  );
}
