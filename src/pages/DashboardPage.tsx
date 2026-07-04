import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  fetchAccountBalances,
  fetchMonthlySummary,
  type AccountBalance,
  type MonthlySummaryResponse,
} from '../api/dashboard';

function formatCurrency(amount: number, currency?: string): string {
  const symbol =
    currency === 'USD' ? '$' :
    currency === 'EUR' ? '€' :
    currency === 'ILS' ? '₪' :
    currency === 'GBP' ? '£' :
    currency || '€';
  return `${symbol}${amount.toFixed(2)}`;
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function navigateMonth(monthStr: string, direction: -1 | 1): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1 + direction);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// --- Sub-components ---

function BalanceCardSkeleton() {
  return (
    <div style={styles.balanceCard}>
      <div style={{ ...styles.skeletonLine, width: '60%', height: '1rem' }} />
      <div style={{ ...styles.skeletonLine, width: '40%', height: '0.75rem', marginTop: '0.5rem' }} />
      <div style={{ ...styles.skeletonLine, width: '50%', height: '1.25rem', marginTop: '0.75rem' }} />
    </div>
  );
}

function BalanceCard({ account }: { account: AccountBalance }) {
  const balanceColor = account.currentBalance < 0 ? '#dc2626' : '#16a34a';

  return (
    <div style={styles.balanceCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#1e293b' }}>
          {account.name}
        </h3>
        <span style={styles.typeBadge}>{account.type}</span>
      </div>
      <p
        style={{
          margin: '0.75rem 0 0',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: balanceColor,
        }}
      >
        {formatCurrency(account.currentBalance, account.currency)}
      </p>
    </div>
  );
}

function AccountBalancesSection({ balances, isLoading, error }: {
  balances: AccountBalance[] | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  if (error) {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Account Balances</h2>
        <div style={styles.errorBox}>
          <p>⚠️ Failed to load account balances</p>
          <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{error.message}</p>
        </div>
      </section>
    );
  }

  const nonExternal = balances?.filter((a) => !a.isExternal) ?? [];
  const total = nonExternal.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <section style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={styles.sectionTitle}>Account Balances</h2>
        {!isLoading && balances && (
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
            Total: {formatCurrency(total)}
          </span>
        )}
      </div>

      {isLoading ? (
        <div style={styles.cardGrid}>
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
        </div>
      ) : balances && balances.length === 0 ? (
        <p style={styles.emptyText}>No accounts yet. Create one to get started.</p>
      ) : (
        <div style={styles.cardGrid}>
          {balances?.map((account) => (
            <BalanceCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </section>
  );
}

function MonthlySummarySection({ summaryData, isLoading, error }: {
  summaryData: MonthlySummaryResponse | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());

  const currentSummary = summaryData?.months?.find((s) => s.month === selectedMonth);
  const loanDifference = summaryData?.loanDifference ?? 0;
  const net = (currentSummary?.totalIncome ?? 0) - (currentSummary?.totalExpenses ?? 0);

  if (error) {
    return (
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Monthly Summary</h2>
        <div style={styles.errorBox}>
          <p>⚠️ Failed to load monthly summary</p>
          <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{error.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>Monthly Summary</h2>

      <div style={styles.monthNav}>
        <button
          onClick={() => setSelectedMonth(navigateMonth(selectedMonth, -1))}
          style={styles.monthNavBtn}
          aria-label="Previous month"
        >
          ◀
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
          {formatMonth(selectedMonth)}
        </span>
        <button
          onClick={() => setSelectedMonth(navigateMonth(selectedMonth, 1))}
          style={styles.monthNavBtn}
          aria-label="Next month"
          disabled={selectedMonth >= getCurrentMonthStr()}
        >
          ▶
        </button>
      </div>

      {isLoading ? (
        <div style={styles.summaryGrid}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={styles.summaryCard}>
              <div style={{ ...styles.skeletonLine, width: '60%', height: '0.75rem' }} />
              <div style={{ ...styles.skeletonLine, width: '80%', height: '1.25rem', marginTop: '0.5rem' }} />
            </div>
          ))}
        </div>
      ) : !currentSummary ? (
        <p style={styles.emptyText}>No data for {formatMonth(selectedMonth)}.</p>
      ) : (
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.summaryCard, borderLeft: '4px solid #16a34a' }}>
            <span style={styles.summaryLabel}>Income</span>
            <span style={{ ...styles.summaryValue, color: '#16a34a' }}>
              {formatCurrency(currentSummary.totalIncome)}
            </span>
          </div>
          <div style={{ ...styles.summaryCard, borderLeft: '4px solid #dc2626' }}>
            <span style={styles.summaryLabel}>Expenses</span>
            <span style={{ ...styles.summaryValue, color: '#dc2626' }}>
              {formatCurrency(currentSummary.totalExpenses)}
            </span>
          </div>
          <div style={{ ...styles.summaryCard, borderLeft: `4px solid ${net >= 0 ? '#16a34a' : '#dc2626'}` }}>
            <span style={styles.summaryLabel}>Net</span>
            <span style={{ ...styles.summaryValue, color: net >= 0 ? '#16a34a' : '#dc2626' }}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </span>
          </div>
          <div style={{ ...styles.summaryCard, borderLeft: '4px solid #2563eb' }}>
            <span style={styles.summaryLabel}>Transfers</span>
            <span style={{ ...styles.summaryValue, color: '#2563eb' }}>
              {formatCurrency(currentSummary.totalTransfers)}
            </span>
          </div>
          <div style={{ ...styles.summaryCard, borderLeft: '4px solid #8b5cf6' }}>
            <span style={styles.summaryLabel}>Loan Difference</span>
            <span style={{ ...styles.summaryValue, color: '#8b5cf6' }}>
              {loanDifference >= 0 ? '+' : ''}{formatCurrency(loanDifference)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

// --- Main Page ---

export default function DashboardPage() {
  const navigate = useNavigate();

  const balancesQuery = useQuery({
    queryKey: ['account-balances'],
    queryFn: fetchAccountBalances,
  });

  const summaryQuery = useQuery({
    queryKey: ['monthly-summary'],
    queryFn: fetchMonthlySummary,
  });

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
          Dashboard
        </h1>
        <div style={styles.quickActions}>
          <button
            onClick={() => navigate('/transactions/new')}
            style={{ ...styles.actionBtn, backgroundColor: '#2563eb', color: '#fff' }}
          >
            + New Transaction
          </button>
          <button
            onClick={() => navigate('/transactions')}
            style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#334155' }}
          >
            📋 View Transactions
          </button>
          <button
            onClick={() => navigate('/transfers/outstanding')}
            style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#334155' }}
          >
            🔗 Outstanding Transfers
          </button>
        </div>
      </header>

      <AccountBalancesSection
        balances={balancesQuery.data}
        isLoading={balancesQuery.isLoading}
        error={balancesQuery.error}
      />

      <MonthlySummarySection
        summaryData={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        error={summaryQuery.error}
      />
    </main>
  );
}

// --- Styles ---

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '1.5rem 1rem',
  },
  header: {
    marginBottom: '2rem',
  },
  quickActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  actionBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  balanceCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fff',
  },
  typeBadge: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    letterSpacing: '0.025em',
  },
  monthNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0',
  },
  monthNavBtn: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#fff',
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem',
  },
  summaryCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fff',
  },
  summaryLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  summaryValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: 700,
    marginTop: '0.25rem',
  },
  errorBox: {
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    padding: '1rem 0',
  },
  skeletonLine: {
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    animation: 'pulse 1.5s infinite',
  },
};
