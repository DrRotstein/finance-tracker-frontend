export interface Transaction {
  id: string;
  date: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  description: string;
  fromAccount: { id: string; name: string } | null;
  toAccount: { id: string; name: string } | null;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  type?: string;
  account_id?: string;
  category_id?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionPayload {
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  date: string;
  categoryId: string | null;
  description?: string;
}

export interface UpdateTransactionPayload {
  type?: 'expense' | 'income' | 'transfer';
  amount?: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  date?: string;
  categoryId?: string | null;
  description?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionsResponse> {
  const params = new URLSearchParams();

  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  if (filters.type) params.set('type', filters.type);
  if (filters.account_id) params.set('account_id', filters.account_id);
  if (filters.category_id) params.set('category_id', filters.category_id);
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 20));

  const response = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }
  const json = await response.json();
  return {
    transactions: json.data,
    total: json.meta.total,
    page: json.meta.page,
    limit: json.meta.limit,
  };
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.status}`);
  }
  return response.json();
}

export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create transaction: ${response.status}`);
  }
  return response.json();
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload
): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update transaction: ${response.status}`);
  }
  return response.json();
}
