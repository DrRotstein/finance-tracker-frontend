import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchRelationsForTransaction,
  removeMember,
  deleteRelation,
  type Relation,
} from '../api/relations';
import type { Transaction } from '../api/transactions';

interface RelationDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
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
  maxWidth: '520px',
  maxHeight: '70vh',
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

export default function RelationDetailModal({ transaction, onClose }: RelationDetailModalProps) {
  const queryClient = useQueryClient();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState('');

  const {
    data: relations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['relations-for-transaction', transaction.id],
    queryFn: () => fetchRelationsForTransaction(transaction.id),
  });

  const handleUnlink = useCallback(
    async (relation: Relation) => {
      setActionInProgress(relation.id);
      setError('');
      try {
        await removeMember(relation.id, transaction.id);
        await refetch();
        queryClient.invalidateQueries({ queryKey: ['relations'] });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unlink');
      } finally {
        setActionInProgress(null);
      }
    },
    [transaction.id, refetch, queryClient]
  );

  const handleDeleteRelation = useCallback(
    async (relation: Relation) => {
      setActionInProgress(`delete-${relation.id}`);
      setError('');
      try {
        await deleteRelation(relation.id);
        await refetch();
        queryClient.invalidateQueries({ queryKey: ['relations'] });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete relation');
      } finally {
        setActionInProgress(null);
      }
    },
    [refetch, queryClient]
  );

  return (
    <div style={overlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-label="Transaction relations">
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
            🔗 Linked Transactions
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Relations for: {transaction.category?.name || '—'} — {formatDate(transaction.date)}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {isLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Loading relations…</p>
          ) : !relations || relations.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              No relations found for this transaction.
            </p>
          ) : (
            relations.map((relation) => (
              <div
                key={relation.id}
                style={{
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {relation.type === 'transfer_pair' ? '↔️ Transfer Pair' : '📎 Group'}
                    </span>
                    {relation.label && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                        — {relation.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleUnlink(relation)}
                      disabled={actionInProgress === relation.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.6875rem',
                        borderRadius: '4px',
                        border: '1px solid #fca5a5',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: actionInProgress === relation.id ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                      }}
                      title="Remove this transaction from the relation"
                    >
                      {actionInProgress === relation.id ? '…' : 'Unlink'}
                    </button>
                    <button
                      onClick={() => handleDeleteRelation(relation)}
                      disabled={actionInProgress === `delete-${relation.id}`}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.6875rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#fff',
                        color: '#6b7280',
                        cursor:
                          actionInProgress === `delete-${relation.id}`
                            ? 'not-allowed'
                            : 'pointer',
                        fontWeight: 500,
                      }}
                      title="Delete entire relation"
                    >
                      {actionInProgress === `delete-${relation.id}` ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div style={{ padding: '0.5rem 0' }}>
                  {relation.members.map((member) => {
                    const memberTx = member.transaction;
                    const isCurrentTx = member.transactionId === transaction.id;
                    return (
                      <div
                        key={member.transactionId}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: isCurrentTx ? '#fffbeb' : 'transparent',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div>
                          {memberTx ? (
                            <>
                              <span style={{ color: '#64748b' }}>{formatDate(memberTx.date)}</span>
                              {' — '}
                              <span>{memberTx.category?.name || '—'}</span>
                              {memberTx.description && (
                                <span style={{ color: '#94a3b8' }}> ({memberTx.description})</span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>
                              Transaction {member.transactionId.slice(0, 8)}…
                            </span>
                          )}
                          {isCurrentTx && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.6875rem',
                                color: '#d97706',
                                fontWeight: 500,
                              }}
                            >
                              (this)
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: '#6b7280',
                              backgroundColor: '#f1f5f9',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                            }}
                          >
                            {member.role}
                          </span>
                          {memberTx && (
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  memberTx.type === 'income'
                                    ? '#16a34a'
                                    : memberTx.type === 'expense'
                                      ? '#dc2626'
                                      : '#2563eb',
                              }}
                            >
                              {formatAmount(memberTx.amount, memberTx.type)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
