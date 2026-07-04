export interface LoanTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  counterparty: string;
  direction: 'lent' | 'borrowed';
  status: 'active' | 'completed';
  balance: number;
  createdAt: string;
  transactions?: LoanTransaction[];
}

export interface CreateLoanPayload {
  counterparty: string;
  direction: 'lent' | 'borrowed';
}

export interface CreateLoanTransactionPayload {
  amount: number;
  type: 'income' | 'expense';
  description?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchLoans(status?: 'active' | 'completed'): Promise<Loan[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const url = `${API_BASE}/loans${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch loans: ${response.status}`);
  }
  return response.json();
}

export async function fetchLoan(id: string): Promise<Loan> {
  const response = await fetch(`${API_BASE}/loans/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch loan: ${response.status}`);
  }
  return response.json();
}

export async function createLoan(payload: CreateLoanPayload): Promise<Loan> {
  const response = await fetch(`${API_BASE}/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create loan: ${response.status}`);
  }
  return response.json();
}

export async function createLoanTransaction(
  loanId: string,
  payload: CreateLoanTransactionPayload
): Promise<LoanTransaction> {
  const response = await fetch(`${API_BASE}/loans/${loanId}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to add loan transaction: ${response.status}`);
  }
  return response.json();
}

export async function completeLoan(id: string): Promise<Loan> {
  const response = await fetch(`${API_BASE}/loans/${id}/complete`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to complete loan: ${response.status}`);
  }
  return response.json();
}

export async function uncompleteLoan(id: string): Promise<Loan> {
  const response = await fetch(`${API_BASE}/loans/${id}/uncomplete`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to reopen loan: ${response.status}`);
  }
  return response.json();
}

export async function deleteLoan(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/loans/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete loan: ${response.status}`);
  }
}
