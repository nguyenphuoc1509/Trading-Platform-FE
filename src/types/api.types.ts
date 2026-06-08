export interface AuthResponse {
  accessToken: string;
  status: boolean;
  message: string;
  isTwoFactorAuthEnabled: boolean;
  session: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  sendTo: string;
  verificationType: 'EMAIL' | 'PHONE';
}

export interface ResetPasswordRequest {
  otp: string;
  password: string;
}

export interface UserProfile {
  uid: number;
  fullName: string;
  email: string;
  twoFactorEnabled: boolean;
  twoFactorType: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  status: number;
}

export interface ApiResponse {
  message: string;
  status: boolean;
}