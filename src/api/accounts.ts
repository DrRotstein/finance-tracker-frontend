export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE}/accounts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch accounts: ${response.status}`);
  }
  return response.json();
}
