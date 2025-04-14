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
  role: 'admins' | 'users' | null;
  login: (token: string, role: 'admins' | 'users') => void;
  logout: () => void;
  initialize: () => Promise<void>;
  getToken: () => string | null;
  getRole: () => 'admins' | 'users' | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  login: (token, role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt', token);
      localStorage.setItem('role', role); // Store role in localStorage
    }
    set({ isAuthenticated: true, role });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt');
      localStorage.removeItem('role'); // Remove role from localStorage
    }
    set({ user: null, isAuthenticated: false, role: null });
  },
  initialize: async () => {
    let storedRole: 'admins' | 'users' | null = null;
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      // Role initialization logic: Load from localStorage if available
      storedRole = localStorage.getItem('role') as 'admins' | 'users' | null;
      token = localStorage.getItem('jwt');
    }

    try {
      if (token) {
        // Attempt to fetch profile
        // Note: Axios interceptor already adds the token if found in localStorage (client-side)
        const { data } = await authApi.getProfile();
        const user: User = {
          username: data.username,
          email: data.email,
          createdAt: data.created_at
        };
        // Set role from localStorage, ensuring consistency
        set({ user, isAuthenticated: true, isLoading: false, role: storedRole }); 
      } else {
        // If no token, ensure role is cleared from state
        if (typeof window !== 'undefined') {
           localStorage.removeItem('role'); // Also clear from storage if no token
        }
        set({ isLoading: false, role: null }); 
      }
    } catch (_) {
      // Clear auth state and storage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        localStorage.removeItem('role'); 
      }
      set({ user: null, isAuthenticated: false, isLoading: false, role: null }); 
    }
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwt');
    }
    return null; // Return null on server-side
  },
  getRole: () => {
    // Prioritize state
    const stateRole = get().role;
    if (stateRole) {
      return stateRole;
    }
    // Fallback to localStorage only on client-side
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role') as 'admins' | 'users' | null;
    }
    return null; // Return null on server-side
  },
}));