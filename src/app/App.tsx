import React from 'react';
import AppProviders from './providers/AppProviders';
import AppRouter from './router/AppRouter';

const App: React.FC = () => (
  <AppProviders>
    <AppRouter />
  </AppProviders>
);

export default App;
