import { NavLink } from 'react-router-dom';

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#475569',
  transition: 'background-color 0.15s, color 0.15s',
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
      <NavLink to="/" end style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/accounts" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
        💰 Accounts
      </NavLink>
      <NavLink to="/transactions" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
        📋 Transactions
      </NavLink>
      <NavLink to="/loans" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
        🤝 Loans
      </NavLink>
      <NavLink to="/categories" style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}>
        🏷️ Categories
      </NavLink>
    </nav>
  );
}
