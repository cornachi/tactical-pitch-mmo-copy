if (typeof window !== 'undefined' && localStorage.getItem('guest_user')) {
  // 1. Intercepta requisições Fetch da SDK
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    if (url.includes('base44.app/api/')) {
      return new Response(JSON.stringify({ success: true, guest: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return originalFetch(...args);
  };

  // 2. Intercepta requisições XMLHttpRequest (Axios / Base44 Client)
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string' && url.includes('base44.app/api/')) {
      Object.defineProperty(this, 'status', { value: 200, writable: true });
      Object.defineProperty(this, 'responseText', {
        value: JSON.stringify({ success: true, guest: true }),
        writable: true,
      });
      Object.defineProperty(this, 'response', {
        value: JSON.stringify({ success: true, guest: true }),
        writable: true,
      });
    }
    return originalOpen.apply(this, [method, url, ...rest]);
  };
}
