export interface Account {
  id: string;
  name: string;
  type: string;
  starting_balance: number;
  currency: string;
  is_external: boolean;
  balance: number;
}

export interface CreateAccountPayload {
  name: string;
  type: string;
  starting_balance: number;
  currency: string;
  is_external: boolean;
}

export interface UpdateAccountPayload {
  name?: string;
  type?: string;
  starting_balance?: number;
  currency?: string;
  is_external?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE}/accounts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch accounts: ${response.status}`);
  }
  return response.json();
}

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create account: ${response.status}`);
  }
  return response.json();
}

export async function updateAccount(id: string, payload: UpdateAccountPayload): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update account: ${response.status}`);
  }
  return response.json();
}

export async function deleteAccount(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Cannot delete account: it may have associated transactions`);
  }
}
