import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from '@/types/transaction';
import { useCurrency } from '@/hooks/useCurrency';

interface SpendingChartProps {
  data: Record<string, number>;
}

const COLORS = [
  'hsl(234, 89%, 54%)',   // primary
  'hsl(152, 55%, 45%)',   // income
  'hsl(4, 80%, 60%)',     // expense
  'hsl(35, 95%, 55%)',    // orange
  'hsl(280, 60%, 55%)',   // purple
  'hsl(190, 80%, 45%)',   // cyan
  'hsl(320, 70%, 55%)',   // pink
  'hsl(45, 85%, 50%)',    // yellow
];

export function SpendingChart({ data }: SpendingChartProps) {
  const { formatAmount } = useCurrency();

  const chartData = useMemo(() => {
    return Object.entries(data)
      .map(([category, value]) => ({
        name: CATEGORY_LABELS[category as Category] || category,
        value,
        icon: CATEGORY_ICONS[category as Category] || '📦',
        category,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const total = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0),
  [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <span className="text-4xl mb-2">📊</span>
        <p className="text-sm">No expense data yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="font-medium">{data.icon} {data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatAmount(data.value)} ({((data.value / total) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{formatAmount(total)}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.slice(0, 6).map((item, index) => (
          <div key={item.category} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate text-muted-foreground">{item.icon} {item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
