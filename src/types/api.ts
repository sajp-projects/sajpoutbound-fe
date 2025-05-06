
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorType?: string;
}


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


export interface ApiErrorResult {
  success: boolean;
  message?: string;
  errorType?: string;
  details?: Record<string, unknown>;
  data?: unknown;
}


export interface ApiErrorResponse {
  message: string;
  errorType?: string;
  details?: Record<string, unknown>;
}
