if (typeof window !== 'undefined') {
  const isGuestMode = () => !!localStorage.getItem('guest_user');

  // Nunca interceptar chamadas de autenticação — login/register/me precisam
  // chegar ao backend real para que o convidado consiga converter em conta.
  const isAuthCall = (url) => /\/auth\/|login|register|\/me(\?|$|\/)/i.test(url);

  // Interceptador global de Fetch para segurança adicional
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const input = args[0];
    const url = typeof input === 'string' ? input : input?.url || '';

    if (isGuestMode() && url.includes('base44') && !isAuthCall(url)) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return originalFetch.apply(this, args);
  };
}