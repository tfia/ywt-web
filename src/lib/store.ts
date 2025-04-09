import { create } from 'zustand';
import { authApi } from './api';

interface User {
  username: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (token) => {
    localStorage.setItem('jwt', token);
    set({ isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('jwt');
    set({ user: null, isAuthenticated: false });
  },
  initialize: async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        const { data } = await authApi.getProfile();
        const user: User = {
          username: data.email.split('@')[0],  // 暂时用邮箱前缀作为用户名
          email: data.email,
          createdAt: data.created_at
        };
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (_) {
      localStorage.removeItem('jwt');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));