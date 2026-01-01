import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Alert as AlertType } from '@/types/alert';
import { useAlert } from '@/hooks/useAlert';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AlertContainer() {
  const { alerts, removeAlert } = useAlert();

  const getAlertStyles = (level: AlertType['level']) => {
    switch (level) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          text: 'text-green-900',
          title: 'text-green-900 font-semibold',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600',
          text: 'text-amber-900',
          title: 'text-amber-900 font-semibold',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          title: 'text-red-900 font-semibold',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          title: 'text-blue-900 font-semibold',
        };
    }
  };

  const getIcon = (level: AlertType['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.level);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                styles.bg
              )}
            >
              <div className={cn('mt-1 flex-shrink-0', styles.icon)}>
                {getIcon(alert.level)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={styles.title}>{alert.title}</p>
                <p className={cn('text-sm mt-1', styles.text)}>
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className={cn(
                  'flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors',
                  styles.icon
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
