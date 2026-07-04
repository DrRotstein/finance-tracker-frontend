import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransaction,
  createTransaction,
  updateTransaction,
} from '../api/transactions';
import type { CreateTransactionPayload, UpdateTransactionPayload } from '../api/transactions';
import { fetchAccounts } from '../api/accounts';
import TransactionForm from '../components/TransactionForm';
import type { TransactionFormInitialValues } from '../components/TransactionForm';
import { ToastContainer, useToasts } from '../components/Toast';

export default function TransactionFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const { toasts, addToast, dismissToast } = useToasts();
  const [saving, setSaving] = useState(false);

  // Build initial values from URL search params (used by "Log return" flow)
  const initialValues: TransactionFormInitialValues | undefined = (() => {
    const type = searchParams.get('type');
    if (!type) return undefined;

    const values: TransactionFormInitialValues = {};
    if (type === 'expense' || type === 'income' || type === 'transfer') {
      values.type = type;
    }
    const amount = searchParams.get('amount');
    if (amount) values.amount = amount;

    const fromAccountId = searchParams.get('from_account_id');
    if (fromAccountId) values.fromAccountId = fromAccountId;

    const toAccountId = searchParams.get('to_account_id');
    if (toAccountId) values.toAccountId = toAccountId;

    const description = searchParams.get('description');
    if (description) values.description = description;

    return values;
  })();

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
      queryClient.invalidateQueries({ queryKey: ['outstanding-transfers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ txnId, payload }: { txnId: string; payload: UpdateTransactionPayload }) =>
      updateTransaction(txnId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['outstanding-transfers'] });
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
        // If this was a "log return" flow, go back to outstanding transfers
        if (searchParams.get('from_account_id') && searchParams.get('to_account_id')) {
          setTimeout(() => navigate('/transfers/outstanding'), 600);
        } else {
          setTimeout(() => navigate('/transactions'), 600);
        }
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
    // If coming from outstanding transfers, go back there
    if (searchParams.get('from_account_id') && searchParams.get('to_account_id')) {
      navigate('/transfers/outstanding');
    } else {
      navigate('/transactions');
    }
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
        initialValues={initialValues}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onCancel={handleCancel}
        saving={saving}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
