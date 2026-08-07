import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const { user } = useAuth();

  // Busca dados do backend apenas se for um usuário autenticado com conta real
  const { data: apiData } = useQuery({
    queryKey: ['userData', user?.id],
    queryFn: async () => {
      const res = await base44.entities.Clube.list();
      return res?.[0] || {};
    },
    enabled: !!user && !user?.isGuest,
  });

  // Carrega os dados locais caso esteja no Modo Convidado
  const guestData = user?.isGuest
    ? JSON.parse(localStorage.getItem('guest_game_data') || '{}')
    : {};

  const clubData = user?.isGuest ? guestData : apiData;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {user?.isGuest && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>🎮</span>
            <span>Modo Convidado ativo. Seu progresso é salvo localmente no navegador.</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Bem-vindo, {user?.name || 'Treinador'}!
            </h1>
            <p className="text-sm text-slate-400">
              {clubData?.teamName || 'Meu Time FC'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium uppercase">Moedas</span>
            <p className="text-lg font-bold text-amber-400">🪙 {clubData?.coins ?? 1000}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium uppercase">Tática</span>
            <p className="text-lg font-bold text-slate-200">{clubData?.tactics || '4-3-3'}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium uppercase">Vitórias</span>
            <p className="text-lg font-bold text-emerald-400">{clubData?.wins ?? 0}</p>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium uppercase">Derrotas</span>
            <p className="text-lg font-bold text-red-400">{clubData?.losses ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
