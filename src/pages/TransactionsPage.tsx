import { useCallback, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchTransactions, type Transaction } from '../api/transactions';
import { fetchAccounts } from '../api/accounts';
import { fetchRelations, type Relation } from '../api/relations';
import TransactionFiltersBar from '../components/TransactionFiltersBar';
import TransactionRow from '../components/TransactionRow';
import TransactionRowSkeleton from '../components/TransactionRowSkeleton';
import MonthGroupHeader from '../components/MonthGroupHeader';
import Pagination from '../components/Pagination';
import LinkTransferPairModal from '../components/LinkTransferPairModal';
import GroupTransactionsModal from '../components/GroupTransactionsModal';
import RelationDetailModal from '../components/RelationDetailModal';

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

function getRelationsForTransaction(txId: string, relations: Relation[]): Relation[] {
  return relations.filter((r) => r.members.some((m) => m.transaction_id === txId));
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const type = searchParams.get('type') || '';
  const accountId = searchParams.get('account_id') || '';
  const category = searchParams.get('category') || '';
  const dateFrom = searchParams.get('date_from') || '';
  const dateTo = searchParams.get('date_to') || '';
  const offset = Number(searchParams.get('offset') || '0');

  // Modal state
  const [linkPairTarget, setLinkPairTarget] = useState<Transaction | null>(null);
  const [groupTarget, setGroupTarget] = useState<Transaction | null>(null);
  const [relationDetailTarget, setRelationDetailTarget] = useState<Transaction | null>(null);

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

  const { data: relationsData } = useQuery({
    queryKey: ['relations'],
    queryFn: () => fetchRelations(),
    staleTime: 30_000,
  });

  const relations = relationsData ?? [];

  const grouped = useMemo(() => {
    if (!txData?.transactions) return new Map<string, Transaction[]>();
    return groupByMonth(txData.transactions);
  }, [txData]);

  const handleRowClick = useCallback(
    (transaction: Transaction) => {
      navigate(`/transactions/${transaction.id}`);
    },
    [navigate]
  );

  const handlePageChange = useCallback(
    (newOffset: number) => {
      updateParam('offset', newOffset > 0 ? String(newOffset) : '');
    },
    [updateParam]
  );

  const handleLinkSuccess = useCallback(() => {
    setLinkPairTarget(null);
    queryClient.invalidateQueries({ queryKey: ['relations'] });
  }, [queryClient]);

  const handleGroupSuccess = useCallback(() => {
    setGroupTarget(null);
    queryClient.invalidateQueries({ queryKey: ['relations'] });
  }, [queryClient]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isFetching && !isLoading && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Updating…</span>
          )}
          <button
            onClick={() => setGroupTarget({} as Transaction)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            📎 Group
          </button>
          <button
            onClick={() => navigate('/transactions/new')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#1976d2',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            + New Transaction
          </button>
        </div>
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
                  <TransactionRow
                    key={tx.id}
                    transaction={tx}
                    onClick={handleRowClick}
                    relations={getRelationsForTransaction(tx.id, relations)}
                    onViewRelations={setRelationDetailTarget}
                    onLinkPair={setLinkPairTarget}
                    onGroupWith={setGroupTarget}
                  />
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

      {/* Modals */}
      {linkPairTarget && (
        <LinkTransferPairModal
          sourceTransaction={linkPairTarget}
          onClose={() => setLinkPairTarget(null)}
          onSuccess={handleLinkSuccess}
        />
      )}

      {groupTarget && (
        <GroupTransactionsModal
          initialTransactions={groupTarget.id ? [groupTarget] : []}
          onClose={() => setGroupTarget(null)}
          onSuccess={handleGroupSuccess}
        />
      )}

      {relationDetailTarget && (
        <RelationDetailModal
          transaction={relationDetailTarget}
          onClose={() => setRelationDetailTarget(null)}
        />
      )}
    </div>
  );
}
