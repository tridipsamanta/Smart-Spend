import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { useNotifications } from '@/hooks/useNotifications';
import { StatCard } from '@/components/StatCard';
import { SpendingChart } from '@/components/SpendingChart';
import { DailySpendingChart } from '@/components/DailySpendingChart';
import { TransactionItem } from '@/components/TransactionItem';
import { AddTransactionSheet } from '@/components/AddTransactionSheet';
import { NotificationCenter } from '@/components/NotificationCenter';
import { TransactionHistory } from '@/components/TransactionHistory';
import { BottomNav } from '@/components/BottomNav';

export default function Index() {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,
    getTotalIncome, 
    getTotalExpenses, 
    getExpensesByCategory,
    getDailySpending,
  } = useTransactions();
  const { formatAmount } = useCurrency();
  const { addNotification } = useNotifications();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthlyIncome = getTotalIncome(currentYear, currentMonth);
  const monthlyExpenses = getTotalExpenses(currentYear, currentMonth);
  const balance = monthlyIncome - monthlyExpenses;
  const savings = Math.max(0, balance);
  const expensesByCategory = getExpensesByCategory(currentYear, currentMonth);
  const dailySpending = getDailySpending(currentYear, currentMonth);

  const recentTransactions = useMemo(() => 
    transactions.slice(0, 5),
  [transactions]);

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-transparent backdrop-blur-lg border-b border-border/0">
        <div className="container max-w-2xl mx-auto px-4 py-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="SmartSpend" className="h-8 w-8" />
              <div>
                <h1 className="text-xl brand-font">
                  <span className="text-[#0B1E3A]">Smart</span>
                  <span className="text-[#2DA44E]">Spend</span>
                </h1>
                <p className="text-sm text-muted-foreground">{monthName} {currentYear}</p>
              </div>
            </div>
            <NotificationCenter />
          </motion.div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <StatCard
            title="Balance"
            value={formatAmount(balance)}
            icon={<Wallet className="h-5 w-5" />}
            delay={0}
          />
          <StatCard
            title="Income"
            value={formatAmount(monthlyIncome)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="income"
            delay={0.1}
          />
          <StatCard
            title="Expenses"
            value={formatAmount(monthlyExpenses)}
            icon={<TrendingDown className="h-5 w-5" />}
            variant="expense"
            delay={0.2}
          />
          <StatCard
            title="Savings"
            value={formatAmount(savings)}
            icon={<PiggyBank className="h-5 w-5" />}
            variant="savings"
            delay={0.3}
          />
        </section>

        {/* Spending by Category */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="finance-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Spending by Category</h2>
            <Link 
              to="/analytics" 
              className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <SpendingChart data={expensesByCategory} />
        </motion.section>

        {/* Daily Spending */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="finance-card"
        >
          <h2 className="text-lg font-semibold mb-4">Daily Spending</h2>
          <DailySpendingChart data={dailySpending} daysInMonth={daysInMonth} />
        </motion.section>

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            {transactions.length > 0 && (
              <TransactionHistory />
            )}
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="finance-card text-center py-12">
              <span className="text-4xl mb-4 block">💸</span>
              <p className="text-muted-foreground mb-2">No transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Tap the + button to add your first transaction
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={deleteTransaction}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>

      <AddTransactionSheet onAdd={addTransaction} />
      <BottomNav />
    </div>
  );
}
