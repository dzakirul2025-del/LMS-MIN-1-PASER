/**
 * Universal safe API client for LMS MIN 1 Paser
 * Mengatasi masalah iframe cookie blockage, auto-inject Bearer token,
 * dan mencegah error 'Unexpected token' saat menerima response non-JSON (HTML error dari Cloud Run/Vite).
 */

export const AUTH_TOKEN_KEY = 'lms_min1paser_token';
export const AUTH_USER_KEY = 'lms_min1paser_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredSession(token?: string, user?: any) {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (e) {}
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function safeApiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  // Tambahkan Bearer token jika ada di localStorage
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type jika body berupa string dan belum diset
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Mengirimkan cookie jika browser mengizinkan
  };

  try {
    const res = await fetch(url, finalOptions);
    const rawText = await res.text();

    // Coba parse teks sebagai JSON
    let parsedData: any = null;
    let isJson = false;

    if (rawText && rawText.trim().length > 0) {
      try {
        parsedData = JSON.parse(rawText);
        isJson = true;
      } catch (jsonErr) {
        isJson = false;
      }
    }

    // Jika response HTTP berstatus error (!res.ok)
    if (!res.ok) {
      if (isJson && parsedData && (parsedData.error || parsedData.message)) {
        throw new Error(parsedData.error || parsedData.message);
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error('Sesi Super Admin telah kedaluwarsa atau belum terverifikasi. Silakan masuk kembali.');
      }

      if (res.status === 404) {
        throw new Error(`Rute layanan '${url}' tidak ditemukan (404).`);
      }

      // Jika ada teks non-JSON seperti "The page cannot be found"
      if (rawText.toLowerCase().includes('the page') || rawText.includes('<!DOCTYPE')) {
        throw new Error(`Layanan server sedang dimuat atau rute belum siap (${res.status}). Silakan coba beberapa saat lagi.`);
      }

      throw new Error(`Gagal memproses permintaan (Status ${res.status}).`);
    }

    // Response HTTP 200 OK
    if (isJson) {
      return parsedData;
    }

    // Jika status 200 tapi bukan JSON (misal raw string)
    return { success: true, data: rawText };
  } catch (err: any) {
    console.warn(`[safeApiFetch] ${url} error:`, err.message || err);
    throw err;
  }
}
