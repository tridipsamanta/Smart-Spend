export type AlertLevel = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  duration?: number; // in milliseconds
}
