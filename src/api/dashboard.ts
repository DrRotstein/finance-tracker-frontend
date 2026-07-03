export interface AccountBalance {
  id: string;
  name: string;
  type: string;
  current_balance: number;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expenses: number;
  total_transfers: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchAccountBalances(): Promise<AccountBalance[]> {
  const response = await fetch(`${API_BASE}/accounts/balances`);
  if (!response.ok) {
    throw new Error(`Failed to fetch account balances: ${response.status}`);
  }
  return response.json();
}

export async function fetchMonthlySummary(): Promise<MonthlySummary[]> {
  const response = await fetch(`${API_BASE}/transactions/monthly-summary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch monthly summary: ${response.status}`);
  }
  return response.json();
}
