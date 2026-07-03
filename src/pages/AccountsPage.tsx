import { useEffect, useState, useCallback } from 'react';
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
  type CreateAccountPayload,
  type UpdateAccountPayload,
} from '../api/accounts';
import AccountCard from '../components/AccountCard';
import AccountForm from '../components/AccountForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer, useToasts } from '../components/Toast';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const { toasts, addToast, dismissToast } = useToasts();

  const loadAccounts = useCallback(async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleAddClick = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDeleteClick = (account: Account) => {
    setDeletingAccount(account);
  };

  const handleSave = async (data: CreateAccountPayload | UpdateAccountPayload) => {
    setSaving(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data);
        addToast(`Account "${(data as CreateAccountPayload).name || editingAccount.name}" updated`, 'success');
      } else {
        await createAccount(data as CreateAccountPayload);
        addToast(`Account "${(data as CreateAccountPayload).name}" created`, 'success');
      }
      setShowForm(false);
      setEditingAccount(null);
      await loadAccounts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccount) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deletingAccount.id);
      addToast(`Account "${deletingAccount.name}" deleted`, 'success');
      setDeletingAccount(null);
      await loadAccounts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Delete failed', 'error');
      setDeletingAccount(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  if (loading) {
    return <p>Loading accounts…</p>;
  }

  if (error && accounts.length === 0) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>💰 Accounts</h1>
        {!showForm && (
          <button
            onClick={handleAddClick}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: '#fff',
            }}
          >
            + Add Account
          </button>
        )}
      </div>

      {showForm && (
        <AccountForm
          account={editingAccount}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      )}

      {accounts.length === 0 && !showForm ? (
        <p>No accounts yet. Add one to get started!</p>
      ) : (
        accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))
      )}

      {accounts.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <p style={{ margin: 0, fontWeight: 600, textAlign: 'right' }}>
            Total Net Balance:{' '}
            <span style={{ fontSize: '1.125rem' }}>
              {accounts.reduce((sum, a) => sum + a.currentBalance, 0).toFixed(2)}
            </span>
          </p>
        </div>
      )}

      {deletingAccount && (
        <ConfirmDialog
          title="Delete Account"
          message={`Are you sure you want to delete "${deletingAccount.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingAccount(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
