import { createClient } from '@base44/sdk';

// Instância real do SDK (carregada apenas quando o usuário NÃO for convidado)
let realClientInstance = null;

const getRealClient = () => {
  if (!realClientInstance) {
    realClientInstance = createClient({
      appId: import.meta.env.VITE_BASE44_APP_ID || '6a6a151',
    });
  }
  return realClientInstance;
};

// Verifica em tempo de execução se o usuário é convidado
const isGuest = () => typeof window !== 'undefined' && !!localStorage.getItem('guest_user');

// Proxy genérico que responde automaticamente a qualquer chamada do SDK no Modo Convidado
const createMockProxy = () => {
  return new Proxy(() => Promise.resolve({ success: true, guest: true, data: [] }), {
    get(target, prop) {
      if (prop === 'then') return undefined;
      return createMockProxy();
    },
    apply() {
      return Promise.resolve({ success: true, guest: true, data: [] });
    },
  });
};

const mockAuth = {
  me: async () => null,
  login: async () => ({ success: true }),
  register: async () => ({ success: true }),
  logout: async () => {
    localStorage.removeItem('guest_user');
  },
};

// Exporta um Proxy inteligente que alterna entre o SDK Real e o Mock sem disparar requisições
export const base44 = new Proxy(
  {},
  {
    get(target, prop) {
      if (isGuest()) {
        if (prop === 'auth') return mockAuth;
        return createMockProxy();
      }
      return getRealClient()[prop];
    },
  }
);
