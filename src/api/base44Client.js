import { createClient } from '@base44/sdk';

const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('guest_user');

const realClient = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || '6a6a151',
});

// Cliente simulado (Mock) para o Modo Convidado (evita chamadas de rede e erros 404)
const mockClient = {
  auth: {
    me: async () => null,
    register: async (credentials) => {
      localStorage.removeItem('guest_user');
      return await realClient.auth.register(credentials);
    },
    login: async (credentials) => {
      localStorage.removeItem('guest_user');
      return await realClient.auth.login(credentials);
    },
    logout: async () => {
      localStorage.removeItem('guest_user');
    },
  },
  entities: new Proxy({}, {
    get: () => ({
      list: async () => [],
      filter: async () => [],
      create: async (data) => data,
      update: async (data) => data,
      delete: async () => ({}),
    }),
  }),
};

export const base44 = isGuest ? mockClient : realClient;
