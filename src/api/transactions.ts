export interface Transaction {
  id: string;
  date: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  category: string;
  description: string;
  from_account: { id: string; name: string } | null;
  to_account: { id: string; name: string } | null;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  offset: number;
  limit: number;
}

export interface TransactionFilters {
  date_from?: string;
  date_to?: string;
  type?: string;
  account_id?: string;
  category?: string;
  offset?: number;
  limit?: number;
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
  if (filters.category) params.set('category', filters.category);
  params.set('offset', String(filters.offset ?? 0));
  params.set('limit', String(filters.limit ?? 20));

  const response = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }
  return response.json();
}

export const CATEGORY_PRESETS = [
  'groceries',
  'transport',
  'food & drink',
  'entertainment',
  'salary',
  'freelance',
  'rent',
  'utilities',
  'subscription',
  'health',
  'education',
  'shopping',
  'gifts',
  'other',
] as const;

export type CategoryPreset = (typeof CATEGORY_PRESETS)[number];
