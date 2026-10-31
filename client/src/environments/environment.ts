const isLocalhost4200 = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '4200';

export const environment = {
  production: false,
  apiUrl: isLocalhost4200 ? 'http://localhost:5000/api' : '/api'
};
