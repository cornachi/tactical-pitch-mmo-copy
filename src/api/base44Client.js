import { createClient } from '@base44/sdk';

const guestSafeFetch = async (input, init) => {
  const isGuest = typeof window !== 'undefined' && !!localStorage.getItem('guest_user');

  if (isGuest) {
    return new Response(
      JSON.stringify({
        success: true,
        guest: true,
        data: [],
      }),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return fetch(input, init);
};

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || '6a6a151',
  fetch: guestSafeFetch,
});
