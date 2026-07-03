import type { Transaction } from '../api/transactions';
import type { Relation } from '../api/relations';
import RelationBadge from './RelationBadge';
import TransactionActionMenu from './TransactionActionMenu';

interface TransactionRowProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
  relations?: Relation[];
  onViewRelations?: (transaction: Transaction) => void;
  onLinkPair?: (transaction: Transaction) => void;
  onGroupWith?: (transaction: Transaction) => void;
}

function getTypeColor(type: Transaction['type']): string {
  switch (type) {
    case 'income':
      return '#16a34a';
    case 'expense':
      return '#dc2626';
    case 'transfer':
      return '#2563eb';
  }
}

function getTypeIcon(type: Transaction['type']): string {
  switch (type) {
    case 'income':
      return '↗';
    case 'expense':
      return '↙';
    case 'transfer':
      return '↔';
  }
}

function formatAmount(amount: number, type: Transaction['type']): string {
  const abs = Math.abs(amount).toFixed(2);
  switch (type) {
    case 'income':
      return `+$${abs}`;
    case 'expense':
      return `-$${abs}`;
    case 'transfer':
      return `$${abs}`;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAccountDisplay(transaction: Transaction): string {
  const from = transaction.from_account?.name ?? '—';
  const to = transaction.to_account?.name ?? '—';
  if (transaction.type === 'transfer') {
    return `${from} → ${to}`;
  }
  if (transaction.type === 'expense') {
    return from;
  }
  return to;
}

export default function TransactionRow({
  transaction,
  onClick,
  relations = [],
  onViewRelations,
  onLinkPair,
  onGroupWith,
}: TransactionRowProps) {
  const typeColor = getTypeColor(transaction.type);

  return (
    <div
      onClick={() => onClick(transaction)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(transaction);
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 32px 1fr 1fr auto auto auto',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
        {formatDate(transaction.date)}
      </span>

      <span
        style={{
          fontSize: '1rem',
          color: typeColor,
          fontWeight: 600,
          textAlign: 'center',
        }}
        title={transaction.type}
      >
        {getTypeIcon(transaction.type)}
      </span>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.category}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.description || getAccountDisplay(transaction)}
        </div>
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: '#64748b',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {getAccountDisplay(transaction)}
      </div>

      <span
        style={{
          fontWeight: 600,
          fontSize: '0.875rem',
          color: typeColor,
          whiteSpace: 'nowrap',
        }}
      >
        {formatAmount(transaction.amount, transaction.type)}
      </span>

      <span>
        {relations.length > 0 && onViewRelations && (
          <RelationBadge
            relations={relations}
            onClick={() => onViewRelations(transaction)}
          />
        )}
      </span>

      <span>
        {(onLinkPair || onGroupWith) && (
          <TransactionActionMenu
            transaction={transaction}
            onLinkPair={onLinkPair ?? (() => {})}
            onGroupWith={onGroupWith ?? (() => {})}
          />
        )}
      </span>
    </div>
  );
}
