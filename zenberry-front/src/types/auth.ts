export interface CustomerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  customer: CustomerData;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  acceptsMarketing: boolean;
}

export interface UpdateProfileResponse {
  customer: CustomerData;
  message: string;
  accessToken?: string;
  expiresAt?: string;
}
