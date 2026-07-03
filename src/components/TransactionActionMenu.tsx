import { useState, useRef, useEffect } from 'react';
import type { Transaction } from '../api/transactions';

interface TransactionActionMenuProps {
  transaction: Transaction;
  onLinkPair: (transaction: Transaction) => void;
  onGroupWith: (transaction: Transaction) => void;
}

export default function TransactionActionMenu({
  transaction,
  onLinkPair,
  onGroupWith,
}: TransactionActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Transaction actions"
        aria-expanded={isOpen}
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '1rem',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          borderRadius: '4px',
          lineHeight: 1,
          color: '#64748b',
        }}
      >
        ⋮
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e2e8f0',
            minWidth: '180px',
            padding: '0.25rem',
          }}
        >
          {transaction.type === 'transfer' && (
            <button
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onLinkPair(transaction);
              }}
              style={menuItemStyle}
            >
              ↔️ Link as Transfer Pair
            </button>
          )}
          <button
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onGroupWith(transaction);
            }}
            style={menuItemStyle}
          >
            📎 Add to Group
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'background-color 0.1s',
};
