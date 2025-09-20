'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Notification from './Notification';

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error') => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      show: false,
    }));
  }, []);

  // Listen for custom events from toggle switches and other components
  useEffect(() => {
    const handleCustomNotification = (event: any) => {
      showNotification(event.detail.message, event.detail.type);
    };

    window.addEventListener('showNotification', handleCustomNotification);
    return () => window.removeEventListener('showNotification', handleCustomNotification);
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
}