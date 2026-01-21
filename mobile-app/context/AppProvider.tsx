import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from '@/contexts/notification-context';

/**
 * Combined App Providers
 * Wraps the app with all necessary providers
 */
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
};
