import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchTransactions, type Transaction } from '../api/transactions';
import { fetchAccounts } from '../api/accounts';
import TransactionFiltersBar from '../components/TransactionFiltersBar';
import TransactionRow from '../components/TransactionRow';
import TransactionRowSkeleton from '../components/TransactionRowSkeleton';
import MonthGroupHeader from '../components/MonthGroupHeader';
import Pagination from '../components/Pagination';

const LIMIT = 20;

function groupByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(key, [tx]);
    }
  }
  return groups;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || '';
  const accountId = searchParams.get('account_id') || '';
  const category = searchParams.get('category') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const offset = Number(searchParams.get('offset') || '0');

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // Reset to first page when filters change
        if (key !== 'offset') {
          next.delete('offset');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
    staleTime: 60_000,
  });

  const {
    data: txData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['transactions', { type, accountId, category, dateFrom, dateTo, offset }],
    queryFn: () =>
      fetchTransactions({
        type: type || undefined,
        account_id: accountId || undefined,
        category: category || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        offset,
        limit: LIMIT,
      }),
    placeholderData: keepPreviousData,
  });

  const grouped = useMemo(() => {
    if (!txData?.transactions) return new Map<string, Transaction[]>();
    return groupByMonth(txData.transactions);
  }, [txData]);

  const handleRowClick = useCallback((_transaction: Transaction) => {
    // TODO: Navigate to edit view when available
  }, []);

  const handlePageChange = useCallback(
    (newOffset: number) => {
      updateParam('offset', newOffset > 0 ? String(newOffset) : '');
    },
    [updateParam]
  );

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📋 Transactions</h1>
        {isFetching && !isLoading && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Updating…</span>
        )}
      </div>

      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <TransactionFiltersBar
          type={type}
          accountId={accountId}
          category={category}
          dateFrom={dateFrom}
          dateTo={dateTo}
          accounts={accountsData || []}
          onTypeChange={(v) => updateParam('type', v)}
          onAccountChange={(v) => updateParam('account_id', v)}
          onCategoryChange={(v) => updateParam('category', v)}
          onDateFromChange={(v) => updateParam('date_from', v)}
          onDateToChange={(v) => updateParam('date_to', v)}
          onClearFilters={clearFilters}
        />

        {isLoading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
            <p>Failed to load transactions</p>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        ) : txData && txData.transactions.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No transactions yet</p>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Start logging your first transaction to see it here.
            </p>
          </div>
        ) : (
          <div>
            {Array.from(grouped.entries()).map(([monthKey, transactions]) => (
              <div key={monthKey}>
                <MonthGroupHeader label={formatMonthLabel(monthKey)} />
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} onClick={handleRowClick} />
                ))}
              </div>
            ))}
          </div>
        )}

        {txData && txData.total > 0 && (
          <Pagination
            offset={offset}
            limit={LIMIT}
            total={txData.total}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
