import { createClient } from '@base44/sdk';

let clientInstance = null;

const getClient = () => {
  if (!clientInstance) {
    clientInstance = createClient({
      appId: import.meta.env.VITE_BASE44_APP_ID || '6a6a151',
    });
  }
  return clientInstance;
};

// Limpa resquícios de sessão convidada de versões anteriores (modo convidado removido).
if (typeof window !== 'undefined') {
  localStorage.removeItem('guest_user');
  localStorage.removeItem('guest_game_data');
}

// Exporta o SDK real diretamente (autenticação obrigatória).
export const base44 = getClient();