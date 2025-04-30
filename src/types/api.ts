// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorType?: string;
}

// Error response structures
export interface JoiValidationError {
  message: string;
  errorType: "joiValidationError";
  details: Array<{
    message: string;
    path: string[];
    type: string;
  }>;
}

export interface CustomError {
  message: string;
  errorType: string;
}

// Interface untuk respons API dengan errorType dan details
export interface ApiErrorResult {
  success: boolean;
  message?: string;
  errorType?: string;
  details?: Record<string, unknown>;
  data?: unknown;
}

// Error response for type-safe handling
export interface ApiErrorResponse {
  message: string;
  errorType?: string;
  details?: Record<string, unknown>;
}
