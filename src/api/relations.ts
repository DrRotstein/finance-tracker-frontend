import type { Transaction } from './transactions';

// === Outstanding Transfer types (from main) ===

export interface OutstandingTransfer {
  id: string;
  amount: number;
  date: string;
  description: string;
  direction: 'sent' | 'received';
  fromAccount: { id: string; name: string };
  toAccount: { id: string; name: string };
  type: string;
}

// === Relation management types (from feat/transaction-linking) ===

export type RelationType = 'transfer_pair' | 'group';

export interface RelationMember {
  transactionId: string;
  role: string;
  transaction?: Transaction;
}

export interface Relation {
  id: string;
  type: RelationType;
  label?: string;
  members: RelationMember[];
  createdAt: string;
}

export interface CreateRelationPayload {
  type: RelationType;
  label?: string;
}

export interface AddMemberPayload {
  transactionId: string;
  role: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// === Outstanding Transfer functions (from main) ===

export async function fetchOutstandingTransfers(): Promise<OutstandingTransfer[]> {
  const response = await fetch(`${API_BASE}/relations/outstanding`);
  if (!response.ok) {
    throw new Error(`Failed to fetch outstanding transfers: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

export async function dismissRelation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/relations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to dismiss relation: ${response.status}`);
  }
}

export async function addRelationMember(
  relationId: string,
  transactionId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/relations/${relationId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to add relation member: ${response.status}`);
  }
}

// === Relation management functions (from feat/transaction-linking) ===

export async function createRelation(payload: CreateRelationPayload): Promise<Relation> {
  const response = await fetch(`${API_BASE}/relations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create relation: ${response.status}`);
  }
  return response.json();
}

export async function addMember(
  relationId: string,
  payload: AddMemberPayload
): Promise<RelationMember> {
  const response = await fetch(`${API_BASE}/relations/${relationId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to add member: ${response.status}`);
  }
  return response.json();
}

export async function fetchRelations(type?: RelationType): Promise<Relation[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  const response = await fetch(`${API_BASE}/relations?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch relations: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.relations ?? [];
}

export async function fetchRelation(id: string): Promise<Relation> {
  const response = await fetch(`${API_BASE}/relations/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch relation: ${response.status}`);
  }
  return response.json();
}

export async function fetchRelationsForTransaction(transactionId: string): Promise<Relation[]> {
  const params = new URLSearchParams();
  params.set('transactionId', transactionId);
  const response = await fetch(`${API_BASE}/relations?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch relations for transaction: ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : data.relations ?? [];
}

export async function removeMember(relationId: string, transactionId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/relations/${relationId}/members/${transactionId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to unlink transaction: ${response.status}`);
  }
}

export async function deleteRelation(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/relations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete relation: ${response.status}`);
  }
}
