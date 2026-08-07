if (typeof window !== 'undefined') {
  const isGuestMode = () => !!localStorage.getItem('guest_user');

  // Interceptador global de Fetch para segurança adicional
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const input = args[0];
    const url = typeof input === 'string' ? input : input?.url || '';

    if (isGuestMode() && url.includes('base44')) {
      return new Response(
        JSON.stringify({ success: true, guest: true, data: [] }),
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
