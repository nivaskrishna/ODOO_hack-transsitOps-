import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Bell, ShieldAlert, Wrench, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import type { SystemNotification } from '../data/mockData';
import { Badge } from './Badge';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'license':
        return <ShieldAlert className="h-4 w-4 text-brand-warning" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-brand-danger" />;
      case 'trip':
        return <CheckCircle2 className="h-4 w-4 text-brand-success" />;
      case 'vehicle':
        return <AlertTriangle className="h-4 w-4 text-brand-info" />;
    }
  };

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="relative p-2 rounded-full hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-brand-danger text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 sm:w-96 rounded-2xl border border-border-primary bg-bg-card p-4 shadow-2xl glass-panel animate-in fade-in slide-in-from-top-2 duration-200 focus:outline-none"
        >
          <div className="flex items-center justify-between border-b border-border-primary/50 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="danger">{unreadCount} New</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-brand-green hover:text-accent-hover font-semibold cursor-pointer transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-text-secondary">
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start space-x-3 p-2.5 rounded-xl border transition-all duration-200 ${
                    notif.unread
                      ? 'bg-brand-green/5 border-brand-green/10'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-bg-secondary rounded-lg">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-xs font-semibold truncate ${notif.unread ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed break-words">
                      {notif.message}
                    </p>
                  </div>
                  {notif.unread && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="p-1 hover:bg-bg-secondary rounded text-text-secondary hover:text-brand-green transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
