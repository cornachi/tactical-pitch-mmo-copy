import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { I18nProvider } from '@/i18n/I18nContext';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Equipe from '@/pages/Equipe';
import Estadio from '@/pages/Estadio';
import Missoes from '@/pages/Missoes';
import Ranking from '@/pages/Ranking';
import Loja from '@/pages/Loja';
import CopaCampeoes from '@/pages/CopaCampeoes';
import Desafios from '@/pages/Desafios';
import Torneios from '@/pages/Torneios';
import CriarTorneio from '@/pages/CriarTorneio';
import TorneioDetalhe from '@/pages/TorneioDetalhe';
import PrePartida from '@/pages/PrePartida';
import SimularPartida from '@/pages/SimularPartida';
import ResultadoPartida from '@/pages/ResultadoPartida';
import RelatorioTatico from '@/pages/RelatorioTatico';
import RelatorioDesafio from '@/pages/RelatorioDesafio';

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
  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/estadio" element={<Estadio />} />
                <Route path="/missoes" element={<Missoes />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/loja" element={<Loja />} />
                <Route path="/copa" element={<CopaCampeoes />} />
                <Route path="/desafios" element={<Desafios />} />
                <Route path="/desafios/relatorio/:partidaId" element={<RelatorioDesafio />} />
                <Route path="/torneios" element={<Torneios />} />
                <Route path="/torneios/criar" element={<CriarTorneio />} />
                <Route path="/torneios/:id" element={<TorneioDetalhe />} />
                <Route path="/pre-partida" element={<PrePartida />} />
                <Route path="/simular-partida" element={<SimularPartida />} />
                <Route path="/resultado-partida" element={<ResultadoPartida />} />
                <Route path="/relatorio-tatico" element={<RelatorioTatico />} />
              </Route>
              <Route path="*" element={<Home />} />
            </Routes>
          </Router>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}