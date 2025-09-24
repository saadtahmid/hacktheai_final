import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme, getThemeColors } from './ThemeProvider';

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');

  const getIcon = (category: string) => {
    switch (category) {
      case 'donation': return <span className="text-red-500">❤️</span>;
      case 'match': return <span className="text-blue-500">🤝</span>;
      case 'delivery': return <span className="text-green-500">📦</span>;
      case 'volunteer': return <span className="text-purple-500">👥</span>;
      case 'system': return <span className="text-orange-500">⚠️</span>;
      default: return <span className="text-gray-500">🔔</span>;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'priority') return notification.priority === 'high' || notification.priority === 'urgent';
    return true;
  });

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-all duration-200"
        style={{
          color: colors.text.secondary,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? 'rgba(55, 65, 81, 0.5)'
            : 'rgba(243, 244, 246, 0.5)';
          e.currentTarget.style.color = colors.text.primary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.text.secondary;
        }}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-96 rounded-2xl shadow-2xl border-0 z-50 max-h-96 overflow-hidden backdrop-blur-sm"
          style={{
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            boxShadow: colors.shadow,
            border: 'none'
          }}
        >
          {/* Header */}
          <div
            className="p-6 bg-transparent flex justify-between items-center"
            style={{ borderBottom: 'none' }}
          >
            <h3
              className="font-bold text-lg"
              style={{ color: colors.text.primary }}
            >
              Notifications
            </h3>
            <div
              className="flex items-center space-x-3"
            >
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium transition-all duration-200 border-none cursor-pointer px-3 py-2 rounded-lg"
                  style={{
                    color: '#3b82f6',
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: 'none'
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full border-none cursor-pointer bg-transparent transition-all duration-200"
                style={{
                  color: colors.text.secondary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span className="text-lg">✕</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className="px-6 py-4 bg-transparent"
          >
            <div
              className="flex space-x-2 p-1 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.8)',
                borderRadius: '0.75rem',
                padding: '0.25rem'
              }}
            >
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: `Unread (${unreadCount})` },
                { key: 'priority', label: 'Priority' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className="text-sm px-4 py-2 rounded-lg transition-all duration-200 font-medium border-none cursor-pointer"
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: filter === tab.key
                      ? (isDark ? colors.bg.tertiary : '#ffffff')
                      : 'transparent',
                    color: filter === tab.key
                      ? colors.text.primary
                      : colors.text.secondary,
                    boxShadow: filter === tab.key ? colors.shadow : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto bg-transparent px-2 pb-2">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center" style={{ color: colors.text.secondary }}>
                <div className="text-5xl mb-3" style={{ color: colors.text.tertiary }}>🔔</div>
                <p className="text-sm font-medium">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="mx-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: !notification.read
                        ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                        : 'transparent',
                      borderRadius: '0.75rem',
                      margin: '0 1rem',
                      padding: '1rem',
                      transition: 'all 0.2s ease',
                      border: !notification.read
                        ? (isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.1)')
                        : '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? 'rgba(55, 65, 81, 0.3)'
                        : 'rgba(243, 244, 246, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = !notification.read
                        ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                        : 'transparent';
                    }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full" style={{
                        backgroundColor: !notification.read
                          ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                          : (isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)'),
                        borderRadius: '50%',
                        padding: '0.5rem'
                      }}>
                        {getIcon(notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm" style={{ color: colors.text.primary }}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2 ml-2">
                            {notification.priority === 'urgent' && (
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="p-1.5 rounded-full transition-all duration-200"
                              style={{
                                color: colors.text.secondary,
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark
                                  ? 'rgba(55, 65, 81, 0.5)'
                                  : 'rgba(243, 244, 246, 0.5)';
                                e.currentTarget.style.color = colors.text.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = colors.text.secondary;
                              }}
                            >
                              <span className="text-xs">✕</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: colors.text.secondary }}>
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium" style={{ color: colors.text.tertiary }}>
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;