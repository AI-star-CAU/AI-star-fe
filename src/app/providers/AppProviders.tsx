import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/context/AuthProvider';
import AppErrorBoundary from '../errors/AppErrorBoundary';
import QueryProvider from './QueryProvider';
import ToastProvider from './ToastProvider';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppErrorBoundary>
    <ToastProvider>
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </AuthProvider>
      </QueryProvider>
    </ToastProvider>
  </AppErrorBoundary>
);

export default AppProviders;
