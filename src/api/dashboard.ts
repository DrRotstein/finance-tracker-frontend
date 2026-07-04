const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface AccountBalance {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  currency?: string;
  isExternal?: boolean;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
}

export async function fetchAccountBalances(): Promise<AccountBalance[]> {
  const response = await fetch(`${API_BASE}/accounts/balances`);
  if (!response.ok) {
    throw new Error(`Failed to fetch account balances: ${response.status}`);
  }
  const json = await response.json();
  return json.accounts;
}

export async function fetchMonthlySummary(): Promise<MonthlySummary[]> {
  const response = await fetch(`${API_BASE}/transactions/monthly-summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch monthly summary: ${response.status}`);
  }
  const json = await response.json();
  return json.months;
}
