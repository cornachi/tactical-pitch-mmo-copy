import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { I18nProvider } from '@/i18n/I18nContext';
import Login from '@/pages/Login';
import Home from '@/pages/Home';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-100 font-semibold text-sm">
        Carregando jogo...
      </div>
    );
  }

  // Libera o acesso direto ao jogo sem redirecionar obrigatoriamente para /login
  return children;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <Router>
            <Routes>
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Router>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}