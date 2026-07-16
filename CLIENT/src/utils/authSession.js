/**
 * Auth Session Utility
 *
 * Tek kaynak: token/refreshToken/user saklama, 401 yakalama ve
 * access-token yenileme. Tüm axios instance'ları buradaki
 * attachAuthInterceptors ile aynı davranışı paylaşır.
 */
import axios from 'axios';
import { removeUserData } from './userStorage';

const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem('refreshToken');
  } catch {
    return null;
  }
};

export const setAccessToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch {
    // storage hatası uygulamayı kırmamalı
  }
};

export const setRefreshToken = (token) => {
  try {
    localStorage.setItem('refreshToken', token);
  } catch {
    // storage hatası uygulamayı kırmamalı
  }
};

/** Oturumla ilgili HER ŞEYİ temizler (token + refreshToken + user). */
export const clearSession = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } catch {
    // storage hatası uygulamayı kırmamalı
  }
  removeUserData();
};

export const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path !== '/login' && path !== '/register') {
    window.location.href = '/login';
  }
};

// Tek uçuşluk refresh: paralel 401'ler aynı isteği bekler,
// backend'e tek refresh çağrısı gider.
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'));
    }
    // Bare axios: instance interceptor'larına girmesin (401 döngüsü olmasın)
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { bearer: { refreshToken } })
      .then((res) => {
        const accessToken = res.data?.bearer?.accessToken;
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

const isAuthPath = (url = '') => AUTH_PATHS.some((p) => url.includes(p));

/**
 * Ortak auth davranışını bir axios instance'ına bağlar:
 * - request: Bearer token ekle
 * - response 401: bir kez refresh dene ve isteği tekrarla;
 *   olmazsa oturumu TAMAMEN temizle ve /login'e yönlendir.
 */
export const attachAuthInterceptors = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;

      if (response?.status !== 401 || !config || config._retried || isAuthPath(config.url)) {
        return Promise.reject(error);
      }

      try {
        const newToken = await refreshAccessToken();
        config._retried = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return instance(config);
      } catch {
        clearSession();
        redirectToLogin();
        return Promise.reject(error);
      }
    }
  );

  return instance;
};
