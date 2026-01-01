import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  Category, 
  PaymentMethod,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  PAYMENT_METHOD_LABELS,
} from '@/types/transaction';
import { useNotifications } from '@/context/NotificationsContext';
import { useAlert } from '@/hooks/useAlert';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const BUDGET_STORAGE_KEY = 'smartspend_budgets';

interface AddTransactionSheetProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function AddTransactionSheet({ onAdd }: AddTransactionSheetProps) {
  const [open, setOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { showAlert } = useAlert();
  const { currency } = useCurrency();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    onAdd({
      type,
      amount: parsedAmount,
      category: category as Category,
      date,
      notes: notes || undefined,
      paymentMethod,
    });

    const categoryLabel = CATEGORY_LABELS[category as Category];

    // Add notification
    addNotification({
      type: 'transaction',
      title: `${type === 'income' ? 'Income Added' : 'Expense Added'}`,
      message: `${type === 'income' ? 'Received' : 'Spent'} ${currency}${parsedAmount.toFixed(2)} for ${categoryLabel}${notes ? ` - ${notes}` : ''}`,
      timestamp: new Date().toISOString(),
      read: false,
      data: {
        transactionType: type,
        amount: parsedAmount,
        category,
        categoryLabel,
        notes,
        currency,
      },
    });

    // Check budget limits for expenses
    if (type === 'expense') {
      const budgets = JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) || '[]');
      const budget = budgets.find((b: any) => b.category === category);
      
      if (budget) {
        const spent = budget.spent + parsedAmount;
        const percentUsed = (spent / budget.limit) * 100;

        if (spent > budget.limit) {
          showAlert(
            '⚠️ Budget Exceeded',
            `You have exceeded your ${categoryLabel} budget! Spent: ${currency}${spent.toFixed(2)} / Limit: ${currency}${budget.limit.toFixed(2)}`,
            'error',
            6000
          );
        } else if (percentUsed >= 75) {
          showAlert(
            '⚠️ Budget Warning',
            `You've used ${percentUsed.toFixed(0)}% of your ${categoryLabel} budget (${currency}${spent.toFixed(2)} / ${currency}${budget.limit.toFixed(2)})`,
            'warning',
            5000
          );
        }
      }
    }

    toast({
      title: 'Transaction added',
      description: `${type === 'income' ? 'Income' : 'Expense'} of ${parsedAmount} added successfully`,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8 md:h-14 md:w-auto md:px-6 md:rounded-2xl z-50"
        >
          <Plus className="h-6 w-6" />
          <span className="hidden md:inline ml-2">Add Transaction</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col">
        <SheetHeader className="pb-4 shrink-0">
          <SheetTitle className="text-xl">Add Transaction</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 pb-8">
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-secondary rounded-xl">
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCategory('');
                  }}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all',
                    type === t
                      ? t === 'expense'
                        ? 'bg-expense text-expense-foreground shadow-md'
                        : 'bg-income text-income-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'expense' ? 'Expense' : 'Income'}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl h-14 font-semibold"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95',
                      category === cat
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {CATEGORY_LABELS[cat].split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add a note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              size="lg" 
              className={cn(
                'w-full h-14 text-base font-semibold rounded-xl',
                type === 'expense' ? 'bg-expense hover:bg-expense/90' : 'bg-income hover:bg-income/90'
              )}
            >
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
