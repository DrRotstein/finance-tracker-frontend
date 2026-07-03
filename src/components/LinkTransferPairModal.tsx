import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, type Transaction } from '../api/transactions';
import { createRelation, addMember } from '../api/relations';

interface LinkTransferPairModalProps {
  sourceTransaction: Transaction;
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
  maxWidth: '560px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount: number, type: string): string {
  const abs = Math.abs(amount).toFixed(2);
  if (type === 'income') return `+$${abs}`;
  if (type === 'expense') return `-$${abs}`;
  return `$${abs}`;
}

export default function LinkTransferPairModal({
  sourceTransaction,
  onClose,
  onSuccess,
}: LinkTransferPairModalProps) {
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const { data: txData, isLoading } = useQuery({
    queryKey: ['transactions-for-linking', search],
    queryFn: () =>
      fetchTransactions({
        type: 'transfer',
        limit: 20,
      }),
    staleTime: 30_000,
  });

  const filteredTransactions = (txData?.transactions ?? []).filter(
    (tx) =>
      tx.id !== sourceTransaction.id &&
      (search === '' ||
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.from_account?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.to_account?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = useCallback(async () => {
    if (!selectedTx) return;
    setIsCreating(true);
    setError('');
    try {
      const relation = await createRelation({ type: 'transfer_pair' });
      await addMember(relation.id, {
        transaction_id: sourceTransaction.id,
        role: 'outgoing',
      });
      await addMember(relation.id, {
        transaction_id: selectedTx.id,
        role: 'incoming',
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transfer pair');
    } finally {
      setIsCreating(false);
    }
  }, [selectedTx, sourceTransaction.id, onSuccess]);

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label="Link as transfer pair">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            🔗 Link as Transfer Pair
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Select the counterpart transaction for this transfer.
          </p>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            Source transaction:
          </div>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.8125rem',
            }}
          >
            <strong>{formatDate(sourceTransaction.date)}</strong> —{' '}
            {sourceTransaction.from_account?.name ?? '—'} → {sourceTransaction.to_account?.name ?? '—'}{' '}
            — <span style={{ color: '#2563eb' }}>{formatAmount(sourceTransaction.amount, sourceTransaction.type)}</span>
          </div>
        </div>

        <div style={{ padding: '1rem 1.5rem' }}>
          <input
            type="text"
            placeholder="Search transfers by description, account..."
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
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 1.5rem',
            maxHeight: '300px',
          }}
        >
          {isLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Loading transfers…</p>
          ) : filteredTransactions.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              No matching transfer transactions found.
            </p>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTx(tx);
                  }
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  marginBottom: '0.5rem',
                  borderRadius: '6px',
                  border: `2px solid ${selectedTx?.id === tx.id ? '#2563eb' : '#e2e8f0'}`,
                  backgroundColor: selectedTx?.id === tx.id ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <strong>{formatDate(tx.date)}</strong> — {tx.from_account?.name ?? '—'} →{' '}
                    {tx.to_account?.name ?? '—'}
                  </span>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>
                    {formatAmount(tx.amount, tx.type)}
                  </span>
                </div>
                {tx.description && (
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {tx.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {error && (
          <div style={{ padding: '0 1.5rem', color: '#dc2626', fontSize: '0.8125rem' }}>
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
            disabled={!selectedTx || isCreating}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: selectedTx && !isCreating ? '#2563eb' : '#94a3b8',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: selectedTx && !isCreating ? 'pointer' : 'not-allowed',
            }}
          >
            {isCreating ? 'Linking…' : 'Link Pair'}
          </button>
        </div>
      </div>
    </div>
  );
}
