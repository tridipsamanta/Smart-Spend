import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';

interface DailySpendingChartProps {
  data: Record<number, number>;
  daysInMonth: number;
}

export function DailySpendingChart({ data, daysInMonth }: DailySpendingChartProps) {
  const { formatAmount } = useCurrency();

  const chartData = useMemo(() => {
    const result = [];
    for (let day = 1; day <= Math.min(daysInMonth, 31); day++) {
      result.push({
        day,
        amount: data[day] || 0,
      });
    }
    return result;
  }, [data, daysInMonth]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <span className="text-4xl mb-2">📈</span>
        <p className="text-sm">No spending data yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-48"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => (value % 5 === 0 ? value : '')}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => value > 0 ? `${value}` : ''}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-xs text-muted-foreground">Day {label}</p>
                    <p className="font-medium">{formatAmount(payload[0].value as number)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="amount" 
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.amount > 0 
                  ? `hsl(234, 89%, ${54 + (1 - entry.amount / maxAmount) * 30}%)`
                  : 'hsl(var(--muted))'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
