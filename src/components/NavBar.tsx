import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOutstandingTransfers } from '../api/relations';

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#475569',
  transition: 'background-color 0.15s, color 0.15s',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: '#eff6ff',
  color: '#2563eb',
};

export default function NavBar() {
  const { data: outstanding } = useQuery({
    queryKey: ['outstanding-transfers'],
    queryFn: fetchOutstandingTransfers,
    refetchInterval: 30000,
  });

  const outstandingCount = outstanding?.length ?? 0;

  return (
    <nav
      style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <NavLink
        to="/"
        end
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        📊 Dashboard
      </NavLink>
      <NavLink
        to="/accounts"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        💰 Accounts
      </NavLink>
      <NavLink
        to="/transactions"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        📋 Transactions
      </NavLink>
      <NavLink
        to="/transfers/outstanding"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
      >
        🔗 Outstanding
        {outstandingCount > 0 && (
          <span
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '0.125rem 0.375rem',
              minWidth: '1.125rem',
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            {outstandingCount}
          </span>
        )}
      </NavLink>
    </nav>
  );
}
