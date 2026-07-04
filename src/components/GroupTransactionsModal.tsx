import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, type Transaction } from '../api/transactions';
import { createRelation, addMember } from '../api/relations';

interface GroupTransactionsModalProps {
  initialTransactions?: Transaction[];
  onClose: () => void;
  onSuccess: () => void;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatAmount(amount: number, type: string): string {
  const abs = Math.abs(amount).toFixed(2);
  if (type === 'income') return `+$${abs}`;
  if (type === 'expense') return `-$${abs}`;
  return `$${abs}`;
}

export default function GroupTransactionsModal({
  initialTransactions = [],
  onClose,
  onSuccess,
}: GroupTransactionsModalProps) {
  const [label, setLabel] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialTransactions.map((t) => t.id))
  );
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { data: txData, isLoading } = useQuery({
    queryKey: ['transactions-for-grouping'],
    queryFn: () => fetchTransactions({ limit: 50 }),
    staleTime: 30_000,
  });

  const allTransactions = txData?.transactions ?? [];

  const filteredTransactions = allTransactions.filter(
    (tx) =>
      search === '' ||
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.fromAccount?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.toAccount?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (selectedIds.size < 2) {
      setError('Select at least 2 transactions to group.');
      return;
    }
    if (!label.trim()) {
      setError('Please provide a group label.');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      const relation = await createRelation({ type: 'group', label: label.trim() });
      for (const txId of selectedIds) {
        await addMember(relation.id, {
          transactionId: txId,
          role: 'member',
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  }, [selectedIds, label, onSuccess]);

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label="Group transactions">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            📎 Group Transactions
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Select transactions and provide a label to group them together.
          </p>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#6b7280',
              marginBottom: '0.375rem',
            }}
          >
            Group Label
          </label>
          <input
            type="text"
            placeholder="e.g., Vacation expenses, Monthly bills..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            aria-label="Group label"
          />
        </div>

        <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            aria-label="Search transactions"
          />
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            {selectedIds.size} selected
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 1.5rem',
            maxHeight: '280px',
          }}
        >
          {isLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Loading…</p>
          ) : filteredTransactions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              No matching transactions found.
            </p>
          ) : (
            filteredTransactions.map((tx) => {
              const isSelected = selectedIds.has(tx.id);
              return (
                <label
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    marginBottom: '0.375rem',
                    borderRadius: '6px',
                    border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(tx.id)}
                    style={{ accentColor: '#2563eb' }}
                    aria-label={`Select transaction ${tx.description || tx.category}`}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>{formatDate(tx.date)}</strong> — {tx.category?.name || '—'}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            tx.type === 'income'
                              ? '#16a34a'
                              : tx.type === 'expense'
                                ? '#dc2626'
                                : '#2563eb',
                        }}
                      >
                        {formatAmount(tx.amount, tx.type)}
                      </span>
                    </div>
                    {tx.description && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                        {tx.description}
                      </div>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>

        {error && (
          <div style={{ padding: '0.5rem 1.5rem', color: '#dc2626', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}

        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedIds.size < 2 || !label.trim() || isCreating}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor:
                selectedIds.size >= 2 && label.trim() && !isCreating ? '#2563eb' : '#94a3b8',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor:
                selectedIds.size >= 2 && label.trim() && !isCreating ? 'pointer' : 'not-allowed',
            }}
          >
            {isCreating ? 'Creating…' : `Create Group (${selectedIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
