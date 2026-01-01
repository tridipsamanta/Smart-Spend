import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Transaction, CATEGORY_ICONS, CATEGORY_LABELS } from '@/types/transaction';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  index?: number;
}

export const TransactionItem = forwardRef<HTMLDivElement, TransactionItemProps>(
  function TransactionItem({ transaction, onDelete, index = 0 }, ref) {
    const { formatAmount } = useCurrency();
    const isExpense = transaction.type === 'expense';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:shadow-md transition-shadow group"
      >
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
          isExpense ? 'bg-expense-muted' : 'bg-income-muted'
        )}>
          {CATEGORY_ICONS[transaction.category]}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {CATEGORY_LABELS[transaction.category]}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {transaction.notes || new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="text-right min-w-[88px] max-w-[120px] sm:max-w-none">
          <p className={cn(
            'font-semibold tabular-nums leading-tight break-words text-sm sm:text-base',
            isExpense ? 'text-expense' : 'text-income'
          )}>
            {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
          </p>
          <p className="text-xs text-muted-foreground capitalize truncate">
            {transaction.paymentMethod}
          </p>
        </div>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    );
  }
);
