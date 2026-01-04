import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token')
  });

  // Guest mode
  const [isGuest, setIsGuest] = useState(localStorage.getItem('is_guest') === 'true');

  // Axios instance with interceptors
  const api = axios.create({
    baseURL: `${API_URL}/api`
  });

  // Request interceptor to add token
  api.interceptors.request.use(
    (config) => {
      if (tokens.access_token) {
        config.headers.Authorization = `Bearer ${tokens.access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ✅ Flag et queue pour éviter boucle infinie
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Response interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // ✅ Enqueue si refresh déjà en cours
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, {
              refresh_token: refreshToken
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            setTokens(prev => ({ ...prev, access_token }));

            processQueue(null, access_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem('access_token');
      const isGuestMode = localStorage.getItem('is_guest') === 'true';

      if (accessToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          // If we have a user, ensure guest mode is off
          if (isGuestMode) {
            setIsGuest(false);
            localStorage.removeItem('is_guest');
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          // Only fully logout if we are not in guest mode
          // But here, if token is invalid, we should probably clear it.
          // If we want to fallback to guest, we could, but better to be explicit.
          if (!isGuestMode) {
            logout();
          } else {
            // If guest mode was active but we had a bad token, just clear the token
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setTokens({ access_token: null, refresh_token: null });
          }
        }
      } else if (isGuestMode) {
        setIsGuest(true);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Register
  const register = async (email, password, username) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        username
      });

      toast.success('Compte créé avec succès ! Connectez-vous maintenant.');
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur lors de la création du compte';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.removeItem('is_guest'); // Clear guest mode
      setIsGuest(false);

      setTokens({ access_token, refresh_token });

      // Load user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);

      toast.success('Connexion réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur de connexion';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Login as Guest
  const loginAsGuest = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setTokens({ access_token: null, refresh_token: null });
    setUser(null);

    localStorage.setItem('is_guest', 'true');
    setIsGuest(true);
    toast.success('Mode invité activé !');
    return { success: true };
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && tokens.access_token) {
        await api.post('/auth/logout', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('is_guest');
      setTokens({ access_token: null, refresh_token: null });
      setUser(null);
      setIsGuest(false);
      toast.info('Déconnexion réussie');
    }
  };

  // Login with OAuth callback tokens
  const loginWithTokens = async (accessToken, refreshToken) => {
    try {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.removeItem('is_guest');
      setIsGuest(false);

      setTokens({ access_token: accessToken, refresh_token: refreshToken });

      // Load user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);

      toast.success('Connexion OAuth réussie !');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur OAuth';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const guestUser = {
    id: 'guest',
    username: 'Invité',
    email: 'mode@invite',
    photoURL: null,
    level: 1,
    xp: 0,
    xpToNextLevel: 100
  };

  const value = {
    user: user || (isGuest ? guestUser : null),
    loading,
    isGuest,
    api,
    register,
    login,
    loginAsGuest,
    logout,
    loginWithTokens,
    isAuthenticated: !!user || isGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
