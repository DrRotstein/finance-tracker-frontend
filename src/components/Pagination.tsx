interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (newOffset: number) => void;
}

export default function Pagination({ offset, limit, total, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <button
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={offset === 0}
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          backgroundColor: offset === 0 ? '#f3f4f6' : '#fff',
          color: offset === 0 ? '#9ca3af' : '#374151',
          cursor: offset === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        ← Prev
      </button>

      <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
        Page {currentPage} of {totalPages}
        {total > 0 && (
          <span style={{ marginLeft: '0.5rem', color: '#9ca3af' }}>
            ({total} total)
          </span>
        )}
      </span>

      <button
        onClick={() => onPageChange(offset + limit)}
        disabled={offset + limit >= total}
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          backgroundColor: offset + limit >= total ? '#f3f4f6' : '#fff',
          color: offset + limit >= total ? '#9ca3af' : '#374151',
          cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
        }}
      >
        Next →
      </button>
    </div>
  );
}
