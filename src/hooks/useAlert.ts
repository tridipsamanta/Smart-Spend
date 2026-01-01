import { useState, useCallback } from 'react';
import { Alert, AlertLevel } from '@/types/alert';
import { useNotifications } from '@/context/NotificationsContext';

export function useAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { addNotification } = useNotifications();

  const showAlert = useCallback((
    title: string,
    message: string,
    level: AlertLevel = 'info',
    duration: number = 5000
  ) => {
    const id = `alert_${Date.now()}`;
    const alert: Alert = {
      id,
      level,
      title,
      message,
      timestamp: new Date().toISOString(),
      duration,
    };

    // Add to alerts (for temporary display)
    setAlerts(prev => [...prev, alert]);

    // Also add to notification history
    addNotification({
      type: 'alert',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      data: { level },
    });

    // Auto-remove after duration
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, duration);

    return id;
  }, [addNotification]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return {
    alerts,
    showAlert,
    removeAlert,
  };
}
