import { v4 as uuidv4 } from 'uuid';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('zoorich_token') || localStorage.getItem('nova_token') || localStorage.getItem('apex_token');
  }

  static async request(path: string, options: RequestInit = {}, withIdempotency = false) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (withIdempotency) {
      // Auto-attach unique idempotency key to prevent double charging
      headers['Idempotency-Key'] = uuidv4();
    }

    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  static get(path: string) {
    return this.request(path, { method: 'GET' });
  }

  static post(path: string, body: any, withIdempotency = false) {
    return this.request(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      withIdempotency
    );
  }

  static put(path: string, body: any) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

