import type { Account } from '../api/accounts';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export default function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const currencySymbol = account.currency === 'USD' ? '$' : account.currency === 'EUR' ? '€' : account.currency === 'ILS' ? '₪' : account.currency === 'GBP' ? '£' : account.currency || '$';
  const balanceColor = account.balance < 0 ? '#d32f2f' : '#2e7d32';

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onEdit(account)}>
        <h3 style={{ margin: 0 }}>
          {account.name}
          {account.is_external && (
            <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '0.5rem' }}>
              (external)
            </span>
          )}
        </h3>
        <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>
          {account.type} • {account.currency || 'EUR'}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontWeight: 600, fontSize: '1.125rem', color: balanceColor }}>
          {currencySymbol}{account.balance.toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(account)}
          title="Edit account"
          aria-label={`Edit ${account.name}`}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(account)}
          title="Delete account"
          aria-label={`Delete ${account.name}`}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
