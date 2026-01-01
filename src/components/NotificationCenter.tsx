import { Bell, Trash2, Check, MessageCircle, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useNotifications } from '@/context/NotificationsContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationCenter() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount,
  } = useNotifications();
  const { currency } = useCurrency();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'transaction':
        return <Send className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'sms':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    if (notification.type === 'transaction' && notification.data?.transactionType) {
      return notification.data.transactionType === 'income'
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200';
    }
    switch (notification.type) {
      case 'transaction':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-amber-50 border-amber-200';
      case 'sms':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = (notification: Notification) => {
    if (notification.type === 'transaction' && notification.data?.transactionType) {
      return notification.data.transactionType === 'income'
        ? 'text-green-900'
        : 'text-red-900';
    }
    return 'text-foreground';
  };

  const getIconColor = (notification: Notification) => {
    if (notification.type === 'transaction' && notification.data?.transactionType) {
      return notification.data.transactionType === 'income'
        ? 'text-green-600'
        : 'text-red-600';
    }
    switch (notification.type) {
      case 'alert':
        return 'text-amber-600';
      case 'sms':
        return 'text-green-600';
      case 'transaction':
      default:
        return 'text-blue-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                {notifications.length === 0
                  ? 'No notifications yet'
                  : `${unreadCount} unread`}
              </DialogDescription>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-destructive"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No notifications yet. Stay tuned for updates!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border-l-4 border transition-all',
                    notification.read
                      ? 'bg-muted/30 border-muted-foreground/20'
                      : getNotificationColor(notification),
                    !notification.read && (
                      notification.type === 'transaction' && notification.data?.transactionType === 'income'
                        ? 'border-l-green-500'
                        : notification.type === 'transaction'
                        ? 'border-l-red-500'
                        : 'border-l-primary'
                    )
                  )}
                  onClick={() => markAsRead(notification.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-1 p-1.5 rounded',
                        !notification.read && 'bg-primary/10'
                      )}
                    >
                      <span className={getIconColor(notification)}>
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-sm', getTitleColor(notification))}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                        {notification.message.replace(/\$|€|£|₹/g, currency)}
                      </p>
                      {notification.type === 'transaction' && notification.data?.transactionType && (
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className={cn(
                              'font-medium',
                              notification.data.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {notification.data.transactionType === 'income' ? '+' : '-'}{currency}{notification.data.amount?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{notification.data.categoryLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className={cn(
                              'font-medium',
                              notification.data.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                            )}>
                              {notification.data.transactionType === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
