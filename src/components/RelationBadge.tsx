import type { Relation } from '../api/relations';

interface RelationBadgeProps {
  relations: Relation[];
  onClick: () => void;
}

export default function RelationBadge({ relations, onClick }: RelationBadgeProps) {
  if (relations.length === 0) return null;

  const hasPair = relations.some((r) => r.type === 'transfer_pair');
  const hasGroup = relations.some((r) => r.type === 'group');

  let icon = '🔗';
  let title = 'Linked transactions';
  if (hasPair && !hasGroup) {
    icon = '↔️';
    title = 'Transfer pair';
  } else if (hasGroup && !hasPair) {
    icon = '📎';
    title = 'Group';
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      aria-label={`${title} — ${relations.length} relation${relations.length > 1 ? 's' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.125rem 0.375rem',
        fontSize: '0.6875rem',
        fontWeight: 600,
        borderRadius: '9999px',
        border: '1px solid #dbeafe',
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        cursor: 'pointer',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{icon}</span>
      {relations.length > 1 && <span>{relations.length}</span>}
    </button>
  );
}
