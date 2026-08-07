import { createClient } from '@base44/sdk';

// Interceptador direto no cliente da Base44 para o Modo Convidado
const guestSafeFetch = async (url, options = {}) => {
  const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('guest_user');

  if (isGuest) {
    return new Response(
      JSON.stringify({
        success: true,
        guest: true,
        data: [],
        user: null,
      }),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return fetch(url, options);
};

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || '6a6a151',
  fetch: guestSafeFetch,
});
