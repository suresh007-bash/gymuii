import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('synnoviq_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', type: 'order', message: 'Your order #ord1 is on its way!', read: false, time: '2 min ago', forUser: 'u1' },
      { id: 'n2', type: 'pack', message: 'Coach Marcus sent you a Muscle Builder Pack', read: false, time: '15 min ago', forUser: 'u1' },
      { id: 'n3', type: 'target', message: 'New nutrition target assigned by your trainer', read: false, time: '1 hour ago', forUser: 'u1' },
      { id: 'n4', type: 'order', message: 'New order #ord4 received', read: false, time: '5 min ago', forUser: 'k1' },
      { id: 'n5', type: 'delivery', message: 'Order #ord1 assigned to you', read: false, time: '3 min ago', forUser: 'd1' },
      { id: 'n6', type: 'system', message: '3 new members registered today', read: false, time: '30 min ago', forUser: 'a1' },
    ];
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('synnoviq_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification) => {
    const n = { ...notification, id: 'n' + Date.now(), read: false, time: 'Just now' };
    setNotifications(prev => [n, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = (userId) => {
    setNotifications(prev => prev.map(n => n.forUser === userId ? { ...n, read: true } : n));
  };

  const getUserNotifications = (userId) => notifications.filter(n => n.forUser === userId);
  const getUnreadCount = (userId) => notifications.filter(n => n.forUser === userId && !n.read).length;

  const showToast = (message, type = 'success') => {
    const toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 3500);
  };

  return (
    <NotificationContext.Provider value={{ notifications, toasts, addNotification, markAsRead, markAllRead, getUserNotifications, getUnreadCount, showToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
