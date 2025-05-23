import axios, { AxiosError } from 'axios'; // Import AxiosError

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

// 请求拦截器
api.interceptors.request.use((config) => {
  // Only access localStorage on the client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Helper function to extract error message
const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>; // Type assertion for response data
    // Check if response data exists and has 'detail' or 'message'
    if (axiosError.response?.data && (axiosError.response.data.detail || axiosError.response.data.message)) {
      return axiosError.response.data.detail || axiosError.response.data.message || axiosError.message;
    }
    // Fallback to Axios error message if no specific backend message
    return axiosError.message; 
  }
  if (error instanceof Error) {
    return error.message; // Standard Error object
  }
  return 'An unknown error occurred'; // Fallback for non-Error types
};

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ModifyUsernameRequest {
  new_username: string;
  password: string;
  role: 'admins' | 'users';
}

export interface ModifyPasswordRequest {
  current_password: string;
  new_password: string;
  role: 'admins' | 'users';
}

export interface DeleteAccountRequest {
  role: 'admins' | 'users';
}

// Add interface for delete user request (admin only)
export interface DeleteUserRequest {
  username: string;
}

export interface ModifyResponse {
  status: string;
}

export interface SendEmailResponse {
  status: string;
}

interface RegisterResponse {
  created_at: string;
}

export interface AuthResponse {
  token: string;
}

interface ProfileResponse {
  username: string;
  email: string;
  created_at: string;
}

// Add interface for user list response
export interface UserListResponse {
  usernames: string[];
  emails: string[];
  created_at: string[];
}

// Add interface for user stats response
export interface UserStatsResponse {
  conversation: number;
  tags: [string, number][];
}

// Add interface for sending email to a single user
export interface SendSingleEmailRequest {
  username: string;
  title: string;
  content: string;
}

// Add interface for clear stats response
export interface ClearStatsResponse {
  status: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/login', credentials),
  
  adminLogin: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/login/admin', credentials),
  
  register: (credentials: RegisterCredentials) =>
    api.post<RegisterResponse>('/register', credentials),
    
  getProfile: () => api.get<ProfileResponse>('/profile'),

  verifyEmail: (username: string, code: string) =>
    api.get(`/verify_email/${username}?code=${code}`),
    
  modifyUsername: (request: ModifyUsernameRequest) =>
    api.post<ModifyResponse>('/modify/username', request),
    
  modifyPassword: (request: ModifyPasswordRequest) =>
    api.post<ModifyResponse>('/modify/password', request),

  deleteAccount: (request: DeleteAccountRequest) => 
    api.post<ModifyResponse>('/modify/delete', request),

  sendEmail: () => api.get<SendEmailResponse>('/send_email'),

  listUsers: () => api.get<UserListResponse>('/users/list'),

  deleteUser: (request: DeleteUserRequest) =>
    api.post<ModifyResponse>('/users/delete', request),

  // Modify getUserStats to use username in the URL path
  getUserStats: (username: string) => 
    api.get<UserStatsResponse>(`/users/stats/${username}`), 

  // Add new API endpoint for sending email to a single user
  sendSingleEmail: (request: SendSingleEmailRequest) =>
    api.post<SendEmailResponse>('/send_email/single', request),

  // Add new API endpoint for fetching logged-in user's stats
  getOwnStats: () => api.get<UserStatsResponse>('/stats'),

  // Add new API endpoint for clearing all user stats
  clearAllStats: () => api.post<ClearStatsResponse>('/stats/clear'),
};

// Export the helper function
export { getApiErrorMessage };