import { Bell, Package, Tag, TrendingUp, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Notification } from "@/src/types/notification";

const NOTIFICATION_CONFIG = {
  order: {
    icon: Package,
    color: "bg-blue-100 text-blue-600",
  },
  promotion: {
    icon: Tag,
    color: "bg-theme-accent-primary/20 text-theme-accent-secondary",
  },
  stock: {
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
  },
  system: {
    icon: Bell,
    color: "bg-gray-100 text-gray-600",
  },
} as const;

interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onDelete,
  onMarkAsRead,
}: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 hover:bg-theme-bg-secondary/50 transition-colors cursor-pointer",
        !notification.read && "bg-theme-accent-primary/5"
      )}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            config.color
          )}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                "text-sm font-semibold",
                !notification.read
                  ? "text-theme-text-primary"
                  : "text-theme-text-secondary"
              )}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-theme-accent-primary rounded-full shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-theme-text-secondary line-clamp-2 mb-2">
            {notification.message}
          </p>
          <span className="text-xs text-theme-text-secondary/70">
            {notification.time}
          </span>
        </div>

        {/* Delete Button */}
        <button
          className="shrink-0 text-theme-text-secondary/50 hover:text-red-500 transition-colors"
          aria-label={`Delete notification: ${notification.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
