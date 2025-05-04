// src/app/core/models/auth.models.ts
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  profileImageUrl?: string;
  roles: string[];
  twoFactorEnabled?: boolean;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  twoFactorRequired?: boolean;
  tempToken?: string;
}
