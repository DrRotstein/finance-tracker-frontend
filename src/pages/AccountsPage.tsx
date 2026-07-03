import { useEffect, useState } from 'react';
import { fetchAccounts, type Account } from '../api/accounts';
import AccountCard from '../components/AccountCard';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts()
      .then(setAccounts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading accounts…</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>💰 Accounts</h1>
        <button
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
        >
          + Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <p>No accounts yet. Add one to get started!</p>
      ) : (
        accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))
      )}
    </div>
  );
}
