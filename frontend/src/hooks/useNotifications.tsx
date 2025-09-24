import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'donation' | 'match' | 'delivery' | 'volunteer' | 'system';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Dummy notification templates for demo
const notificationTemplates = [
  {
    title: 'AI Match Found!',
    getMessage: () => `New AI-powered match found with ${Math.floor(Math.random() * 15) + 85}% compatibility score`,
    type: 'success' as const,
    category: 'match' as const,
    priority: 'high' as const
  },
  {
    title: 'Delivery Update',
    getMessage: () => 'Your donation is being picked up by volunteer',
    type: 'info' as const,
    category: 'delivery' as const,
    priority: 'medium' as const
  },
  {
    title: 'New Volunteer Available',
    getMessage: () => `${['Ahmed Khan', 'Fatima Rahman', 'Mohammad Ali', 'Rashida Begum'][Math.floor(Math.random() * 4)]} is now available in your area`,
    type: 'info' as const,
    category: 'volunteer' as const,
    priority: 'low' as const
  },
  {
    title: 'Emergency Alert',
    getMessage: () => 'Urgent request for medical supplies in flood-affected areas',
    type: 'warning' as const,
    category: 'system' as const,
    priority: 'urgent' as const
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Jonoshongjog! 🎉',
      message: 'Your AI-powered donation platform is ready to help connect donors with those in need',
      type: 'info',
      category: 'system',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      priority: 'medium'
    }
  ]);

  // Add a new dummy notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep only latest 20
  };

  // Add demo notification for hackathon
  const addDemoNotification = (type?: 'match' | 'delivery' | 'volunteer' | 'emergency') => {
    const templates = type
      ? notificationTemplates.filter(t => t.category === type)
      : notificationTemplates;

    const template = templates[Math.floor(Math.random() * templates.length)];

    addNotification({
      title: template.title,
      message: template.getMessage(),
      type: template.type,
      category: template.category,
      priority: template.priority
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate periodic notifications for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance to add a new notification every 3 minutes for demo
      if (Math.random() < 0.2) {
        addDemoNotification();
      }
    }, 180000); // Every 3 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    addDemoNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
};

export type { Notification };