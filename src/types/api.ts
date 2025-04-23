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
