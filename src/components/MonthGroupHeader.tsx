interface MonthGroupHeaderProps {
  label: string;
}

export default function MonthGroupHeader({ label }: MonthGroupHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <span
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
    </div>
  );
}
