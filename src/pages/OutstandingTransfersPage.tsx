import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchOutstandingTransfers,
  dismissRelation,
} from '../api/relations';
import type { OutstandingTransfer } from '../api/relations';
import { ToastContainer, useToasts } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

const cardButtonStyle: React.CSSProperties = {
  padding: '0.375rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.15s, border-color 0.15s',
};

function OutstandingCard({
  item,
  onLogReturn,
  onMarkSettled,
  onDismiss,
}: {
  item: OutstandingTransfer;
  onLogReturn: (item: OutstandingTransfer) => void;
  onMarkSettled: (item: OutstandingTransfer) => void;
  onDismiss: (item: OutstandingTransfer) => void;
}) {
  const directionLabel = item.direction === 'sent' ? 'You sent' : 'You received';
  const directionColor = item.direction === 'sent' ? '#dc2626' : '#16a34a';

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
        backgroundColor: '#fff',
      }}
    >
      {/* Direction & amount header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: directionColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {directionLabel}
          </span>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>
            {item.from_account.name} → {item.to_account.name}
          </div>
        </div>
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#2563eb',
            whiteSpace: 'nowrap',
            marginLeft: '0.5rem',
          }}
        >
          {formatAmount(item.amount)}
        </span>
      </div>

      {/* Details */}
      <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>
            <strong>Date:</strong> {formatDate(item.date)}
          </span>
          {item.description && (
            <span>
              <strong>Note:</strong>{' '}
              <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                &ldquo;{item.description}&rdquo;
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          style={{ ...cardButtonStyle, borderColor: '#2563eb', color: '#2563eb' }}
          onClick={() => onLogReturn(item)}
        >
          ↩️ Log return
        </button>
        <button
          style={{ ...cardButtonStyle, borderColor: '#16a34a', color: '#16a34a' }}
          onClick={() => onMarkSettled(item)}
        >
          ✓ Mark settled
        </button>
        <button
          style={{ ...cardButtonStyle, color: '#64748b' }}
          onClick={() => onDismiss(item)}
        >
          ✕ Dismiss
        </button>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.75rem',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              height: '1.25rem',
              width: '60%',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '0.75rem',
            }}
          />
          <div
            style={{
              height: '0.875rem',
              width: '80%',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '0.5rem',
            }}
          />
          <div
            style={{
              height: '0.875rem',
              width: '40%',
              backgroundColor: '#f1f5f9',
              borderRadius: '4px',
              marginBottom: '0.75rem',
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: '2rem',
                  width: '6rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function OutstandingTransfersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toasts, addToast, dismissToast } = useToasts();
  const [confirmDismissItem, setConfirmDismissItem] = useState<OutstandingTransfer | null>(null);

  const {
    data: transfers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['outstanding-transfers'],
    queryFn: fetchOutstandingTransfers,
  });

  const dismissMutation = useMutation({
    mutationFn: dismissRelation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outstanding-transfers'] });
      addToast('Transfer dismissed', 'success');
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });

  const handleDismiss = (item: OutstandingTransfer) => {
    setConfirmDismissItem(item);
  };

  const confirmDismiss = () => {
    if (confirmDismissItem) {
      dismissMutation.mutate(confirmDismissItem.id);
      setConfirmDismissItem(null);
    }
  };

  const handleLogReturn = (item: OutstandingTransfer) => {
    const params = new URLSearchParams({
      type: 'transfer',
      amount: String(item.amount),
      from_account_id: item.to_account.id,
      to_account_id: item.from_account.id,
      description: `Return: ${item.description || 'transfer'}`,
    });
    navigate(`/transactions/new?${params.toString()}`);
  };

  const handleMarkSettled = (item: OutstandingTransfer) => {
    const params = new URLSearchParams({
      type: 'transfer',
      settle_relation_id: item.id,
    });
    navigate(`/transactions?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
          Outstanding Transfers
        </h1>
        <CardSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
          Outstanding Transfers
        </h1>
        <div
          style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}
        >
          Failed to load outstanding transfers. Please try again later.
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
        Outstanding Transfers
      </h1>

      {transfers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#64748b',
            fontSize: '1rem',
          }}
        >
          No outstanding transfers 🎉
        </div>
      ) : (
        <div>
          {transfers.map((transfer) => (
            <OutstandingCard
              key={transfer.id}
              item={transfer}
              onLogReturn={handleLogReturn}
              onMarkSettled={handleMarkSettled}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {confirmDismissItem && (
        <ConfirmDialog
          title="Dismiss transfer?"
          message="This will remove the outstanding transfer. This action cannot be undone."
          confirmLabel="Dismiss"
          onConfirm={confirmDismiss}
          onCancel={() => setConfirmDismissItem(null)}
        />
      )}
    </main>
  );
}
