import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense' | 'savings';
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  delay = 0 
}: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    income: 'bg-income-muted',
    expense: 'bg-expense-muted',
    savings: 'bg-savings-muted',
  };

  const iconStyles = {
    default: 'bg-secondary text-secondary-foreground',
    income: 'bg-income/10 text-income',
    expense: 'bg-expense/10 text-expense',
    savings: 'bg-primary/10 text-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'stat-card relative overflow-hidden',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums leading-tight break-words max-w-full">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs font-medium flex items-center gap-1',
              trend.isPositive ? 'text-income' : 'text-expense'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl',
          iconStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
