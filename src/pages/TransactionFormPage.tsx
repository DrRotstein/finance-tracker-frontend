import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransaction,
  createTransaction,
  updateTransaction,
} from '../api/transactions';
import type { CreateTransactionPayload, UpdateTransactionPayload } from '../api/transactions';
import { fetchAccounts } from '../api/accounts';
import TransactionForm from '../components/TransactionForm';
import { ToastContainer, useToasts } from '../components/Toast';

export default function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const { toasts, addToast, dismissToast } = useToasts();
  const [saving, setSaving] = useState(false);

  // Fetch accounts for dropdowns
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  // Fetch transaction for edit mode
  const {
    data: transaction,
    isLoading: transactionLoading,
    error: transactionError,
  } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => fetchTransaction(id!),
    enabled: isEdit,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ txnId, payload }: { txnId: string; payload: UpdateTransactionPayload }) =>
      updateTransaction(txnId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
    },
  });

  async function handleSave(data: CreateTransactionPayload) {
    setSaving(true);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ txnId: id!, payload: data as UpdateTransactionPayload });
        addToast('Transaction updated!', 'success');
        setTimeout(() => navigate('/transactions'), 600);
      } else {
        await createMutation.mutateAsync(data);
        addToast('Transaction created!', 'success');
        setTimeout(() => navigate('/transactions'), 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndNew(data: CreateTransactionPayload) {
    setSaving(true);
    try {
      await createMutation.mutateAsync(data);
      addToast('Transaction created! Ready for next.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate('/transactions');
  }

  // Loading states
  if (accountsLoading || (isEdit && transactionLoading)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading…</p>
      </div>
    );
  }

  // Error states
  if (accountsError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#d32f2f' }}>
          Failed to load accounts: {accountsError instanceof Error ? accountsError.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (isEdit && transactionError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#d32f2f' }}>
          Failed to load transaction: {transactionError instanceof Error ? transactionError.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '640px', margin: '0 auto' }}>
      <TransactionForm
        transaction={isEdit ? transaction : null}
        accounts={accounts}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onCancel={handleCancel}
        saving={saving}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
