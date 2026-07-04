import { useState, useEffect, useRef, useMemo } from 'react';
import type { Transaction, CreateTransactionPayload } from '../api/transactions';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/categories';
import type { Account } from '../api/accounts';

type TransactionType = 'expense' | 'income' | 'transfer';

export interface TransactionFormInitialValues {
  type?: TransactionType;
  amount?: string;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
  category?: string;
}

interface TransactionFormProps {
  transaction?: Transaction | null;
  accounts: Account[];
  initialValues?: TransactionFormInitialValues;
  onSave: (data: CreateTransactionPayload) => Promise<void>;
  onSaveAndNew: (data: CreateTransactionPayload) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

interface FormErrors {
  amount?: string;
  fromAccountId?: string;
  toAccountId?: string;
  date?: string;
  category?: string;
}

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function TransactionForm({
  transaction,
  accounts,
  initialValues,
  onSave,
  onSaveAndNew,
  onCancel,
  saving,
}: TransactionFormProps) {
  const isEdit = !!transaction;

  const [type, setType] = useState<TransactionType>(
    transaction?.type || initialValues?.type || 'expense'
  );
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : initialValues?.amount || ''
  );
  const [fromAccountId, setFromAccountId] = useState(
    transaction?.fromAccount?.id || initialValues?.fromAccountId || ''
  );
  const [toAccountId, setToAccountId] = useState(
    transaction?.toAccount?.id || initialValues?.toAccountId || ''
  );
  const [date, setDate] = useState(transaction?.date?.split('T')[0] || getTodayString());
  const [category, setCategory] = useState(
    transaction?.categoryId || initialValues?.category || ''
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const [description, setDescription] = useState(
    transaction?.description || initialValues?.description || ''
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  // Reset account fields when type changes (only in create mode)
  useEffect(() => {
    if (!isEdit) {
      if (type === 'expense') {
        setToAccountId('');
      } else if (type === 'income') {
        setFromAccountId('');
      }
    }
  }, [type, isEdit]);

  // Determine if either selected account is external (person)
  const isExternalTransfer = useMemo(() => {
    if (type !== 'transfer') return false;
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    return !!(fromAcc?.isExternal || toAcc?.isExternal);
  }, [type, fromAccountId, toAccountId, accounts]);

  // Auto-set category to 'transfer' when it's an external transfer
  useEffect(() => {
    if (isExternalTransfer) {
      setCategory('transfer');
    }
  }, [isExternalTransfer]);

  function validate(): FormErrors {
    const errs: FormErrors = {};

    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }

    if (type === 'expense' || type === 'transfer') {
      if (!fromAccountId) {
        errs.fromAccountId = 'From account is required';
      }
    }

    if (type === 'income' || type === 'transfer') {
      if (!toAccountId) {
        errs.toAccountId = 'To account is required';
      }
    }

    if (type === 'transfer' && fromAccountId && toAccountId && fromAccountId === toAccountId) {
      errs.toAccountId = 'From and To accounts must be different';
    }

    if (!date) {
      errs.date = 'Date is required';
    }

    if (!category && !isExternalTransfer) {
      errs.category = 'Category is required';
    }

    return errs;
  }

  function buildPayload(): CreateTransactionPayload {
    return {
      type,
      amount: parseFloat(amount),
      fromAccountId: (type === 'expense' || type === 'transfer') ? fromAccountId : null,
      toAccountId: (type === 'income' || type === 'transfer') ? toAccountId : null,
      date,
      categoryId: category || null,
      description: description.trim() || undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent, saveAndNew: boolean) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = buildPayload();

    if (saveAndNew) {
      await onSaveAndNew(payload);
      // Clear form but keep type and account
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(getTodayString());
      setErrors({});
      amountRef.current?.focus();
    } else {
      await onSave(payload);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    border: '1px solid #d32f2f',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
    fontWeight: 500,
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#d32f2f',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  };

  const typeButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: active ? '2px solid #1976d2' : '1px solid #ccc',
    backgroundColor: active ? '#e3f2fd' : '#fff',
    color: active ? '#1976d2' : '#475569',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <form
      onSubmit={(e) => handleSubmit(e, false)}
      style={{
        border: '1px solid #d0d7de',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem' }}>
        {isEdit ? '✏️ Edit Transaction' : '➕ New Transaction'}
      </h2>

      {/* Type selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setType('expense')}
            style={typeButtonStyle(type === 'expense')}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            style={typeButtonStyle(type === 'income')}
          >
            💰 Income
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            style={typeButtonStyle(type === 'transfer')}
          >
            🔄 Transfer
          </button>
        </div>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="txn-amount" style={labelStyle}>
          Amount *
        </label>
        <input
          id="txn-amount"
          ref={amountRef}
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          style={errors.amount ? inputErrorStyle : inputStyle}
        />
        {errors.amount && <p style={errorTextStyle}>{errors.amount}</p>}
      </div>

      {/* From Account — shown for expense and transfer */}
      {(type === 'expense' || type === 'transfer') && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="txn-from-account" style={labelStyle}>
            From Account *
          </label>
          <select
            id="txn-from-account"
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            style={errors.fromAccountId ? inputErrorStyle : inputStyle}
          >
            <option value="">— Select account —</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
          {errors.fromAccountId && <p style={errorTextStyle}>{errors.fromAccountId}</p>}
        </div>
      )}

      {/* To Account — shown for income and transfer */}
      {(type === 'income' || type === 'transfer') && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="txn-to-account" style={labelStyle}>
            To Account *
          </label>
          <select
            id="txn-to-account"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            style={errors.toAccountId ? inputErrorStyle : inputStyle}
          >
            <option value="">— Select account —</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
          {errors.toAccountId && <p style={errorTextStyle}>{errors.toAccountId}</p>}
        </div>
      )}

      {/* Date */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="txn-date" style={labelStyle}>
          Date *
        </label>
        <input
          id="txn-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={errors.date ? inputErrorStyle : inputStyle}
        />
        {errors.date && <p style={errorTextStyle}>{errors.date}</p>}
      </div>

      {/* Category — hidden when it's an external transfer (auto-set to 'transfer') */}
      {!isExternalTransfer && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="txn-category" style={labelStyle}>
            Category *
          </label>
          <select
            id="txn-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={errors.category ? inputErrorStyle : inputStyle}
          >
            <option value="">— Select category —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p style={errorTextStyle}>{errors.category}</p>}
        </div>
      )}
      {isExternalTransfer && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Category</label>
          <div
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f1f5f9',
              fontSize: '0.875rem',
              color: '#475569',
            }}
          >
            Transfer (auto-set for external accounts)
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="txn-description" style={labelStyle}>
          Description
        </label>
        <input
          id="txn-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes..."
          style={inputStyle}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        {!isEdit && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #1976d2',
              backgroundColor: '#fff',
              color: '#1976d2',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save & New'}
          </button>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#475569',
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
