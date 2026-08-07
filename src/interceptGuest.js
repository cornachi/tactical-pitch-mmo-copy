if (typeof window !== 'undefined') {
  const isGuestMode = () => !!localStorage.getItem('guest_user');

  const createMockResponse = () =>
    new Response(
      JSON.stringify({ success: true, guest: true, data: [] }),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }
    );

  // 1. Intercepta Fetch global
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (isGuestMode() && url.includes('base44.app/api/')) {
      return Promise.resolve(createMockResponse());
    }
    return originalFetch.apply(this, arguments);
  };

  // 2. Intercepta XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    const urlString = typeof url === 'string' ? url : url?.href || '';
    if (isGuestMode() && urlString.includes('base44.app/api/')) {
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
