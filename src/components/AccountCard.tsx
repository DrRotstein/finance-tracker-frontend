import type { Account } from '../api/accounts';

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
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
      <div>
        <h3 style={{ margin: 0 }}>{account.name}</h3>
        <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.875rem' }}>
          {account.type}
        </p>
      </div>
      <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
        ${account.balance.toFixed(2)}
      </div>
    </div>
  );
}
