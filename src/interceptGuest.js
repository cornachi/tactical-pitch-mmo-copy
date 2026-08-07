if (typeof window !== 'undefined') {
  const isGuestMode = () => !!localStorage.getItem('guest_user');

  // Extrai a URL de qualquer formato (String, Request, URL, Object)
  const extractUrl = (input) => {
    if (!input) return '';
    if (typeof input === 'string') return input;
    if (typeof input === 'object') {
      if (input.url) return String(input.url);
      if (input.href) return String(input.href);
      if (typeof input.toString === 'function') return input.toString();
    }
    return String(input);
  };

  const createMockResponse = () =>
    new Response(
      JSON.stringify({ success: true, guest: true, data: [] }),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      }
    );

  // 1. Intercepta Fetch global (API + Analytics)
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = extractUrl(input);
    if (isGuestMode() && url.includes('base44')) {
      return createMockResponse();
    }
    return originalFetch.apply(this, arguments);
  };

  // 2. Intercepta XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    const urlString = extractUrl(url);
    if (isGuestMode() && urlString.includes('base44')) {
      Object.defineProperty(this, 'status', { value: 200, writable: true });
      Object.defineProperty(this, 'responseText', {
        value: JSON.stringify({ success: true, guest: true, data: [] }),
        writable: true,
      });
      Object.defineProperty(this, 'response', {
        value: JSON.stringify({ success: true, guest: true, data: [] }),
        writable: true,
      });
    }
    return originalOpen.apply(this, [method, url, ...rest]);
  };
}
