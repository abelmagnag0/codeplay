import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import type { AuthResponse, User } from '../types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'codeplay-auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readPersistedState = (): AuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { accessToken: null, refreshToken: null, user: null };
    }
    return JSON.parse(raw) as AuthState;
  } catch (_error) {
    return { accessToken: null, refreshToken: null, user: null };
  }
};

const persistState = (state: AuthState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    // ignore persistence errors (storage full, private mode, etc.)
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readPersistedState());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      persistState(state);
    }
  }, [state, isHydrated]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setState({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    });
  }, []);

  const register = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const response = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      setState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    setState({ accessToken: null, refreshToken: null, user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.accessToken && state.user),
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
