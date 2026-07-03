import { useState, useEffect, useRef } from 'react';
import type { Account, CreateAccountPayload, UpdateAccountPayload } from '../api/accounts';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'person', label: 'Person' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES = ['EUR', 'USD', 'ILS', 'GBP', 'CHF'];

interface AccountFormProps {
  account?: Account | null;
  onSave: (data: CreateAccountPayload | UpdateAccountPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function AccountForm({ account, onSave, onCancel, saving }: AccountFormProps) {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState(account?.type || 'bank');
  const [startingBalance, setStartingBalance] = useState(
    account ? String(account.starting_balance ?? 0) : '0'
  );
  const [currency, setCurrency] = useState(account?.currency || 'EUR');
  const [isExternal, setIsExternal] = useState(account?.is_external || false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Account name is required');
      nameRef.current?.focus();
      return;
    }

    const balance = parseFloat(startingBalance);
    if (isNaN(balance) || balance < 0) {
      setValidationError('Starting balance must be a number ≥ 0');
      return;
    }

    const payload: CreateAccountPayload = {
      name: trimmedName,
      type,
      starting_balance: balance,
      currency,
      is_external: isExternal,
    };

    await onSave(payload);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      style={{
        border: '1px solid #d0d7de',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h3 style={{ margin: '0 0 0.75rem' }}>
        {account ? '✏️ Edit Account' : '➕ New Account'}
      </h3>

      {validationError && (
        <p style={{ color: '#d32f2f', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
          {validationError}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="account-name" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            {isExternal ? 'Person/Entity Name' : 'Account Name'} *
          </label>
          <input
            id="account-name"
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isExternal ? 'e.g. John Doe' : 'e.g. Checking Account'}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label htmlFor="account-type" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            Type
          </label>
          <select
            id="account-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.875rem',
            }}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="account-currency" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            Currency
          </label>
          <select
            id="account-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.875rem',
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="account-balance" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            Starting Balance
          </label>
          <input
            id="account-balance"
            type="number"
            step="0.01"
            min="0"
            value={startingBalance}
            onChange={(e) => setStartingBalance(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
          <input
            id="account-external"
            type="checkbox"
            checked={isExternal}
            onChange={(e) => setIsExternal(e.target.checked)}
          />
          <label htmlFor="account-external" style={{ fontSize: '0.875rem' }}>
            External (person/entity)
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#1976d2',
            color: '#fff',
            fontSize: '0.875rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
