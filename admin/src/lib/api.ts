const BASE_URL = 'https://autogest-production-404d.up.railway.app/api';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
  responseType?: 'json' | 'blob';
}

async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, responseType, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Only set Content-Type for non-FormData requests
  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Não autorizado');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  if (responseType === 'blob') {
    const blob = await response.blob();
    return { data: blob } as unknown as T;
  }

  return response.json();
}

export const apiClient = {
  get<T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> {
    return api<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return api<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  put<T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return api<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  patch<T = unknown>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return api<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete<T = unknown>(endpoint: string, options?: ApiOptions): Promise<T> {
    return api<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

export default apiClient;
