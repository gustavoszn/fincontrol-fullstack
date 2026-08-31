const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('fincontrol_token');
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Erro ao processar a solicitação.';
    throw new Error(message);
  }

  return payload;
}

export default apiRequest;
