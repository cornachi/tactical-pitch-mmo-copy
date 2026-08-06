import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Add page imports here
import Home from './pages/Home';
import Equipe from './pages/Equipe';
import ResultadoPartida from './pages/ResultadoPartida';
import Ranking from './pages/Ranking';
import SimularPartida from './pages/SimularPartida';
import PrePartida from './pages/PrePartida';
import Loja from './pages/Loja';
import Estadio from './pages/Estadio';
import Missoes from './pages/Missoes';
import Desafios from './pages/Desafios';
import RelatorioDesafio from './pages/RelatorioDesafio';
import CopaCampeoes from './pages/CopaCampeoes';
import Torneios from './pages/Torneios';
import CriarTorneio from './pages/CriarTorneio';
import TorneioDetalhe from './pages/TorneioDetalhe';
import RelatorioTatico from './pages/RelatorioTatico';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import { I18nProvider } from '@/i18n/I18nContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/simular-partida" element={<SimularPartida />} />
          <Route path="/pre-partida" element={<PrePartida />} />
          <Route path="/resultado-partida" element={<ResultadoPartida />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/estadio" element={<Estadio />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/desafios" element={<Desafios />} />
          <Route path="/desafios/relatorio/:id" element={<RelatorioDesafio />} />
          <Route path="/copa" element={<CopaCampeoes />} />
          <Route path="/torneios" element={<Torneios />} />
          <Route path="/torneios/criar" element={<CriarTorneio />} />
          <Route path="/torneios/:id" element={<TorneioDetalhe />} />
          <Route path="/relatorio-tatico" element={<RelatorioTatico />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", apply); };
  }, []);

  return (
    <AuthProvider>
      <I18nProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </I18nProvider>
    </AuthProvider>
  )
}

export default App;
