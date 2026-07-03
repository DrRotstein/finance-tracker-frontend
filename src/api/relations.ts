export interface OutstandingTransfer {
  id: string;
  amount: number;
  date: string;
  description: string;
  direction: 'sent' | 'received';
  from_account: { id: string; name: string };
  to_account: { id: string; name: string };
  type: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchOutstandingTransfers(): Promise<OutstandingTransfer[]> {
  const response = await fetch(`${API_BASE}/relations/outstanding`);
  if (!response.ok) {
    throw new Error(`Failed to fetch outstanding transfers: ${response.status}`);
  }
  return response.json();
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
    body: JSON.stringify({ transaction_id: transactionId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to add relation member: ${response.status}`);
  }
}
