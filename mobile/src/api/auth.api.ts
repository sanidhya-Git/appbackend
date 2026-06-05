import { apiClient } from './client';
import { ApiResponse, AuthTokens, User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<AuthResult>> {
    const { data } = await apiClient.post('/auth/verify-otp', { email, otp });
    return data;
  },

  async resendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await apiClient.post('/auth/resend-otp', { email });
    return data;
  },

  async login(payload: LoginPayload): Promise<ApiResponse<AuthResult>> {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  async googleAuth(idToken: string): Promise<ApiResponse<AuthResult>> {
    const { data } = await apiClient.post('/auth/google', { idToken });
    return data;
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  async me(): Promise<ApiResponse<User>> {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
