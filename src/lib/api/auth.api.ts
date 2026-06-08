import { apiClient } from './client';
import type {
  AuthResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
} from '@/types/api.types';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient
      .post<AuthResponse>('/auth/signin', { email, password })
      .then((r) => r.data),

  verifyTwoFactorOtp: (otp: string, sessionId: string) =>
    apiClient
      .post<AuthResponse>(`/auth/two-factor/otp/${otp}?id=${sessionId}`)
      .then((r) => r.data),

  sendPasswordResetOtp: (data: ForgotPasswordRequest) =>
    apiClient
      .post<AuthResponse>('/auth/reset-password/send-otp', data)
      .then((r) => r.data),

  verifyPasswordResetOtp: (sessionId: string, data: ResetPasswordRequest) =>
    apiClient
      .post<ApiResponse>(`/auth/reset-password/verify-otp?id=${sessionId}`, data)
      .then((r) => r.data),
};