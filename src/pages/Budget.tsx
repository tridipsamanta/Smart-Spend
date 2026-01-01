import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { useAlert } from '@/hooks/useAlert';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  EXPENSE_CATEGORIES, 
  CATEGORY_LABELS, 
  CATEGORY_ICONS,
  Category,
  BudgetGoal 
} from '@/types/transaction';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const BUDGET_STORAGE_KEY = 'smartspend_budgets';

function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetGoal[]>(() => {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const saveBudgets = (newBudgets: BudgetGoal[]) => {
    setBudgets(newBudgets);
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(newBudgets));
  };

  const addBudget = (category: Category, limit: number) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      const updated = budgets.map(b => 
        b.category === category ? { ...b, limit } : b
      );
      saveBudgets(updated);
    } else {
      saveBudgets([...budgets, { category, limit, spent: 0 }]);
    }
  };

  const removeBudget = (category: Category) => {
    saveBudgets(budgets.filter(b => b.category !== category));
  };

  return { budgets, addBudget, removeBudget };
}

export default function Budget() {
  const { getExpensesByCategory } = useTransactions();
  const { formatAmount, currency } = useCurrency();
  const { showAlert } = useAlert();
  const { budgets, addBudget, removeBudget } = useBudgets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const expensesByCategory = getExpensesByCategory(currentYear, currentMonth);

  const budgetsWithSpending = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      spent: expensesByCategory[budget.category] || 0,
    }));
  }, [budgets, expensesByCategory]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);

  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgets.find(b => b.category === cat)
  );

  const handleAddBudget = () => {
    if (!selectedCategory || !budgetLimit) {
      toast({
        title: 'Missing fields',
        description: 'Please select a category and enter a budget limit',
        variant: 'destructive',
      });
      return;
    }

    const limit = parseFloat(budgetLimit);
    const categoryLabel = CATEGORY_LABELS[selectedCategory as Category];
    
    addBudget(selectedCategory as Category, limit);
    
    // Show success alert
    showAlert(
      'Budget Created',
      `Budget for ${categoryLabel} set to ${currency}${limit.toFixed(2)}`,
      'success',
      4000
    );

    toast({
      title: 'Budget added',
      description: `Budget for ${categoryLabel} has been set`,
    });

    setSelectedCategory('');
    setBudgetLimit('');
    setDialogOpen(false);
  };

  const getStatusColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1) return 'text-destructive';
    if (ratio >= 0.8) return 'text-orange-500';
    return 'text-income';
  };

  const getProgressColor = (spent: number, limit: number) => {
    const ratio = spent / limit;
    if (ratio >= 1) return 'bg-destructive';
    if (ratio >= 0.8) return 'bg-orange-500';
    return 'bg-income';
  };

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
            <h1 className="text-xl font-bold text-foreground">Budget</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="finance-card bg-gradient-to-br from-primary/10 to-primary/5"
        >
          <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">{formatAmount(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-2xl font-bold text-expense">{formatAmount(totalSpent)}</p>
            </div>
          </div>
          {totalBudget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {((totalSpent / totalBudget) * 100).toFixed(0)}% used
                </span>
                <span className="font-medium">
                  {formatAmount(Math.max(0, totalBudget - totalSpent))} left
                </span>
              </div>
              <Progress 
                value={Math.min(100, (totalSpent / totalBudget) * 100)} 
                className="h-3"
              />
            </div>
          )}
        </motion.div>

        {/* Add Budget Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-12 border-dashed"
              disabled={availableCategories.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Category Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(v) => setSelectedCategory(v as Category)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Limit ({currency})</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <Button onClick={handleAddBudget} className="w-full">
                Set Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Budget List */}
        <div className="space-y-3">
          {budgetsWithSpending.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="finance-card text-center py-12"
            >
              <span className="text-4xl mb-4 block">🎯</span>
              <p className="text-muted-foreground mb-2">No budgets set yet</p>
              <p className="text-sm text-muted-foreground">
                Set spending limits for your categories to stay on track
              </p>
            </motion.div>
          ) : (
            budgetsWithSpending.map((budget, index) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = budget.spent > budget.limit;
              const isNearLimit = percentage >= 80 && !isOverBudget;

              return (
                <motion.div
                  key={budget.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="finance-card"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                      {CATEGORY_ICONS[budget.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {CATEGORY_LABELS[budget.category]}
                          </p>
                          {isOverBudget && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                          {!isOverBudget && !isNearLimit && (
                            <CheckCircle2 className="h-4 w-4 text-income" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive -mr-2"
                          onClick={() => removeBudget(budget.category)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={getStatusColor(budget.spent, budget.limit)}>
                          {formatAmount(budget.spent)}
                        </span>
                        <span className="text-muted-foreground">
                          of {formatAmount(budget.limit)}
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, percentage)}%` }}
                          transition={{ duration: 0.8 }}
                          className={cn('h-full rounded-full', getProgressColor(budget.spent, budget.limit))}
                        />
                      </div>
                      {isOverBudget && (
                        <p className="text-xs text-destructive mt-2">
                          Over budget by {formatAmount(budget.spent - budget.limit)}
                        </p>
                      )}
                      {isNearLimit && (
                        <p className="text-xs text-orange-500 mt-2">
                          {formatAmount(budget.limit - budget.spent)} remaining
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
