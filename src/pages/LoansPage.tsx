import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchLoans,
  fetchLoan,
  createLoan,
  createLoanTransaction,
  completeLoan,
  uncompleteLoan,
  deleteLoan,
  type Loan,
  type CreateLoanPayload,
  type CreateLoanTransactionPayload,
} from '../api/loans';

const pageStyle: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '2rem 1rem',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
};

const headingStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: '1.5rem',
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '1rem',
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '0.75rem',
  backgroundColor: '#fff',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  fontSize: '0.8125rem',
  fontWeight: 500,
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  color: '#374151',
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  ...btnSecondary,
  borderColor: '#fca5a5',
  color: '#dc2626',
};

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#fff',
};

const badgeStyle = (direction: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.125rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  borderRadius: '9999px',
  backgroundColor: direction === 'lent' ? '#dbeafe' : '#fef3c7',
  color: direction === 'lent' ? '#1d4ed8' : '#92400e',
});

export default function LoansPage() {
  const queryClient = useQueryClient();
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [newCounterparty, setNewCounterparty] = useState('');
  const [newDirection, setNewDirection] = useState<'lent' | 'borrowed'>('lent');

  const { data: activeLoans = [], isLoading: loadingActive } = useQuery({
    queryKey: ['loans', 'active'],
    queryFn: () => fetchLoans('active'),
  });

  const { data: completedLoans = [], isLoading: loadingCompleted } = useQuery({
    queryKey: ['loans', 'completed'],
    queryFn: () => fetchLoans('completed'),
  });

  const { data: expandedLoan } = useQuery({
    queryKey: ['loan', expandedLoanId],
    queryFn: () => fetchLoan(expandedLoanId!),
    enabled: !!expandedLoanId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLoanPayload) => createLoan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setNewCounterparty('');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setExpandedLoanId(null);
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: (id: string) => uncompleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setExpandedLoanId(null);
    },
  });

  function handleCreateLoan(e: React.FormEvent) {
    e.preventDefault();
    if (!newCounterparty.trim()) return;
    createMutation.mutate({ counterparty: newCounterparty.trim(), direction: newDirection });
  }

  function renderLoanCard(loan: Loan, isActive: boolean) {
    const isExpanded = expandedLoanId === loan.id;

    return (
      <div key={loan.id} style={cardStyle}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
              {loan.counterparty}
            </span>
            <span style={badgeStyle(loan.direction)}>
              {loan.direction === 'lent' ? '→ Lent' : '← Borrowed'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: loan.balance >= 0 ? '#16a34a' : '#dc2626' }}>
              €{Math.abs(loan.balance).toFixed(2)}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {isExpanded && expandedLoan && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Transactions
            </h4>
            {(!expandedLoan.transactions || expandedLoan.transactions.length === 0) ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No transactions yet.</p>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                {expandedLoan.transactions.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#374151' }}>
                      {t.description || t.type}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                      {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <AddTransactionForm loanId={loan.id} />

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {isActive ? (
                <button style={btnSecondary} onClick={() => completeMutation.mutate(loan.id)}>
                  ✓ Complete
                </button>
              ) : (
                <button style={btnSecondary} onClick={() => uncompleteMutation.mutate(loan.id)}>
                  ↩ Reopen
                </button>
              )}
              {(!expandedLoan.transactions || expandedLoan.transactions.length === 0) && (
                <button style={btnDanger} onClick={() => deleteMutation.mutate(loan.id)}>
                  🗑 Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>🤝 Loans</h1>

      {/* Create loan form */}
      <form onSubmit={handleCreateLoan} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
            Counterparty
          </label>
          <input
            type="text"
            value={newCounterparty}
            onChange={(e) => setNewCounterparty(e.target.value)}
            placeholder="e.g. Max, Anna..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>
            Direction
          </label>
          <select value={newDirection} onChange={(e) => setNewDirection(e.target.value as 'lent' | 'borrowed')} style={selectStyle}>
            <option value="lent">I lent money</option>
            <option value="borrowed">I borrowed money</option>
          </select>
        </div>
        <button type="submit" style={btnPrimary} disabled={createMutation.isPending}>
          + New Loan
        </button>
      </form>

      {/* Active Loans */}
      <section style={sectionStyle}>
        <h2 style={subHeadingStyle}>Active Loans</h2>
        {loadingActive ? (
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        ) : activeLoans.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No active loans.</p>
        ) : (
          activeLoans.map((loan) => renderLoanCard(loan, true))
        )}
      </section>

      {/* Completed Loans */}
      <section style={sectionStyle}>
        <h2 style={subHeadingStyle}>Completed Loans</h2>
        {loadingCompleted ? (
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        ) : completedLoans.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No completed loans.</p>
        ) : (
          completedLoans.map((loan) => renderLoanCard(loan, false))
        )}
      </section>
    </div>
  );
}

/* --- Add Transaction sub-form --- */
function AddTransactionForm({ loanId }: { loanId: string }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: CreateLoanTransactionPayload) => createLoanTransaction(loanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setAmount('');
      setDescription('');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    mutation.mutate({ amount: parsed, type, description: description.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        style={{ ...inputStyle, width: '100px' }}
      />
      <select value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')} style={{ ...selectStyle, width: '120px' }}>
        <option value="expense">Payment out</option>
        <option value="income">Payment in</option>
      </select>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Note (optional)"
        style={{ ...inputStyle, width: '150px' }}
      />
      <button type="submit" style={btnPrimary} disabled={mutation.isPending}>
        + Add
      </button>
    </form>
  );
}
