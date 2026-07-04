import { type Account } from '../api/accounts';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/categories';

interface TransactionFiltersBarProps {
  type: string;
  accountId: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  accounts: Account[];
  onTypeChange: (value: string) => void;
  onAccountChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
}

const selectStyle: React.CSSProperties = {
  padding: '0.375rem 0.5rem',
  fontSize: '0.8125rem',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  color: '#374151',
  minWidth: '120px',
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  minWidth: '140px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.6875rem',
  fontWeight: 500,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

export default function TransactionFiltersBar({
  type,
  accountId,
  category,
  dateFrom,
  dateTo,
  accounts,
  onTypeChange,
  onAccountChange,
  onCategoryChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: TransactionFiltersBarProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const hasFilters = type || accountId || category || dateFrom || dateTo;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#fafafa',
        alignItems: 'flex-end',
      }}
    >
      <label style={labelStyle}>
        Type
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
      </label>

      <label style={labelStyle}>
        Account
        <select
          value={accountId}
          onChange={(e) => onAccountChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by account"
        >
          <option value="">All accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Category
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={selectStyle}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        From
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          style={inputStyle}
          aria-label="Date from"
        />
      </label>

      <label style={labelStyle}>
        To
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          style={inputStyle}
          aria-label="Date to"
        />
      </label>

      {hasFilters && (
        <button
          onClick={onClearFilters}
          style={{
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            color: '#6b7280',
            cursor: 'pointer',
            alignSelf: 'flex-end',
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
