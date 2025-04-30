import { ApiResponse, CustomError, JoiValidationError, ApiErrorResult } from "@/types/api";

// Helper untuk proses error umum
export const handleApiError = (result: ApiResponse<unknown>, defaultMessage: string, specificErrors?: Record<string, string>): never => {
  const errorData = result.data as unknown as JoiValidationError | CustomError;

  if (errorData.errorType && specificErrors?.[errorData.errorType]) {
    throw new Error(specificErrors[errorData.errorType]);
  }

  throw new Error(errorData?.message || defaultMessage);
};

// Helper untuk membuat respons error terstruktur
export const createErrorResponse = (result: ApiErrorResult, defaultMessage: string) => ({
  message: result.message || defaultMessage,
  errorType: result.errorType,
  details: result.details,
});
