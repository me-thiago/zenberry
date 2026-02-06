"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { MOCK_NOTIFICATIONS } from "@/src/data/mock-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationsDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function NotificationsDrawer({
  isOpen,
  setIsOpen,
}: NotificationsDrawerProps) {
  const unreadCount = useMemo(
    () => MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
    []
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleMarkAllAsRead = useCallback(() => {
    // TODO: Implement mark all as read logic
    console.log("Mark all as read");
  }, []);

  const handleMarkAsRead = useCallback((id: string) => {
    // TODO: Implement mark as read logic
    console.log("Mark as read:", id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // TODO: Implement delete logic
    console.log("Delete notification:", id);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transition-transform duration-300 transform translate-x-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-theme-text-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-theme-accent-secondary" />
                <h2 className="text-2xl font-bold text-theme-accent-secondary">
                  Notifications
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-theme-text-secondary hover:text-theme-text-primary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm cursor-pointer mt-2 text-theme-accent-primary hover:text-theme-accent-primary/80 bg-transparent hover:bg-transparent"
              >
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {MOCK_NOTIFICATIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-16 h-16 text-theme-text-secondary/30 mb-4" />
                <p className="text-theme-text-secondary text-sm">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-theme-text-secondary/10">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDelete={handleDelete}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {MOCK_NOTIFICATIONS.length > 0 && (
            <div className="p-4 border-t border-theme-text-secondary/10">
              <Button
                variant="ghost"
                className="w-full text-theme-accent-secondary hover:text-theme-accent-secondary/80 hover:bg-theme-accent-primary/10"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
