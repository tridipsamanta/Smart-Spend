import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { SpendingChart } from '@/components/SpendingChart';
import { DailySpendingChart } from '@/components/DailySpendingChart';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from '@/types/transaction';
import { cn } from '@/lib/utils';

export default function Analytics() {
  const { 
    getExpensesByCategory, 
    getDailySpending,
    getTotalIncome,
    getTotalExpenses,
  } = useTransactions();
  const { formatAmount } = useCurrency();

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthlyIncome = getTotalIncome(currentYear, currentMonth);
  const monthlyExpenses = getTotalExpenses(currentYear, currentMonth);
  const expensesByCategory = getExpensesByCategory(currentYear, currentMonth);
  const dailySpending = getDailySpending(currentYear, currentMonth);

  const sortedCategories = useMemo(() => {
    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category: category as Category,
        amount,
        percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
      }));
  }, [expensesByCategory, monthlyExpenses]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    if (nextMonth <= now) {
      setCurrentDate(nextMonth);
    }
  };

  const canGoNext = useMemo(() => {
    const now = new Date();
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    return nextMonth <= now;
  }, [currentYear, currentMonth]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-transparent backdrop-blur-lg border-b border-border/0">
        <div className="container max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Month Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goToNextMonth}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="finance-card bg-income-muted">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-xl sm:text-2xl font-bold text-income leading-tight break-words tabular-nums">
              {formatAmount(monthlyIncome)}
            </p>
          </div>
          <div className="finance-card bg-expense-muted">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-xl sm:text-2xl font-bold text-expense leading-tight break-words tabular-nums">
              {formatAmount(monthlyExpenses)}
            </p>
          </div>
        </motion.div>

        {/* Spending Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="finance-card"
        >
          <h3 className="text-lg font-semibold mb-4">Spending Distribution</h3>
          <SpendingChart data={expensesByCategory} />
        </motion.section>

        {/* Category Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Category Breakdown</h3>
          
          <AnimatePresence mode="wait">
            {sortedCategories.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="finance-card text-center py-8"
              >
                <p className="text-muted-foreground">No expenses this month</p>
              </motion.div>
            ) : (
              <motion.div key="list" className="space-y-3">
                {sortedCategories.map(({ category, amount, percentage }, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="finance-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-expense-muted flex items-center justify-center text-xl">
                        {CATEGORY_ICONS[category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium truncate">
                            {CATEGORY_LABELS[category]}
                          </p>
                          <p className="font-semibold text-expense tabular-nums leading-tight break-words text-sm sm:text-base text-right">
                            {formatAmount(amount)}
                          </p>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                            className="h-full bg-expense rounded-full"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Daily Trend */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="finance-card"
        >
          <h3 className="text-lg font-semibold mb-4">Daily Spending Trend</h3>
          <DailySpendingChart data={dailySpending} daysInMonth={daysInMonth} />
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
