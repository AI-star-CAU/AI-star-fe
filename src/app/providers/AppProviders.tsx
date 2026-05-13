import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../features/auth/context/AuthProvider';
import QueryProvider from './QueryProvider';

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryProvider>
    <AuthProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthProvider>
  </QueryProvider>
);

export default AppProviders;
