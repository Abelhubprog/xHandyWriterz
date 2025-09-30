import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import {
  Bell,
  MessageCircle,
  Clipboard,
  CreditCard,
  FileText,
  Clock,
  AlertCircle,
  X,
  Check,
  Settings
} from 'lucide-react';
import database from '../../lib/d1Client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type_id: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

interface NotificationType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const iconMap = {
  'message-circle': MessageCircle,
  'clipboard': Clipboard,
  'credit-card': CreditCard,
  'file-text': FileText,
  'clock': Clock,
  'bell': AlertCircle
};

export function NotificationCenter() {
  const { user } = useDynamicContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load notification types
    const loadNotificationTypes = async () => {
      const { data, error } = await supabase
        .from('notification_types')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setNotificationTypes(data);
      }
    };

    // Load notifications
    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    loadNotificationTypes();
    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    const { error } = await supabase.rpc('mark_notifications_as_read', {
      p_user_id: user?.id,
      p_notification_ids: [notificationId]
    });

    if (!error) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const { error } = await supabase.rpc('mark_notifications_as_read', {
      p_user_id: user?.id,
      p_notification_ids: null
    });

    if (!error) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const IconComponent = iconMap[type.icon as keyof typeof iconMap] || Bell;
    return <IconComponent className={`h-5 w-5 text-${type.color}-600`} />;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Notification Settings"
              >
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Mark all as read"
              >
                <Check className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => {
                  const type = notificationTypes.find(t => t.id === notification.type_id);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {type && getNotificationIcon(type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{notification.title}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                            >
                              View details
                            </a>
                          )}
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {notificationTypes.map(type => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(type)}
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-gray-600">
                        Receive notifications for {type.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
