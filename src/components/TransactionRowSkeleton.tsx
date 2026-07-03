export default function TransactionRowSkeleton() {
  const shimmer: React.CSSProperties = {
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 32px 1fr 1fr auto',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ ...shimmer, width: '50px', height: '14px' }} />
      <div style={{ ...shimmer, width: '20px', height: '20px', borderRadius: '50%' }} />
      <div>
        <div style={{ ...shimmer, width: '80%', height: '14px', marginBottom: '4px' }} />
        <div style={{ ...shimmer, width: '50%', height: '12px' }} />
      </div>
      <div style={{ ...shimmer, width: '60%', height: '14px' }} />
      <div style={{ ...shimmer, width: '60px', height: '14px' }} />
    </div>
  );
}
