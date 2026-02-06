// Error types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  errors?: ApiError[];
}
