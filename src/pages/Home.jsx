import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  // Exemplo de tratamento para não chamar a API quando for convidado
  const { data } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      // Sua lógica normal de fetch
      return {};
    },
    enabled: !!user && !user.isGuest, // Desativa se for convidado
  });

  return (
    <div className="p-6">
      {user?.isGuest && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4 text-sm">
          🎮 Modo Convidado ativo.
        </div>
      )}
      <h1 className="text-2xl font-bold">
        Bem-vindo, {user?.name || 'Treinador'}!
      </h1>
    </div>
  );
}
