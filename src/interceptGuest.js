if (typeof window !== 'undefined') {
  const isGuest = () => !!localStorage.getItem('guest_user');

  // Extrai a URL independentemente de ser String, Request ou objeto URL
  const getUrl = (input) => {
    if (!input) return '';
    if (typeof input === 'string') return input;
    if (input instanceof Request) return input.url;
    if (input instanceof URL) return input.href;
    return String(input);
  };

  // 1. Intercepta requisições Fetch da SDK
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = getUrl(args[0]);
    if (isGuest() && url.includes('base44.app/api/')) {
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
    const urlString = getUrl(url);
    if (isGuest() && urlString.includes('base44.app/api/')) {
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
    return originalOpen.apply(this, [method, urlString, ...rest]);
  };
}
