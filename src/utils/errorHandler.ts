import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";

// Helper untuk proses error umum
export const handleApiError = (result: ApiResponse<unknown>, defaultMessage: string, specificErrors?: Record<string, string>): never => {
  const errorData = result.data as unknown as JoiValidationError | CustomError;

  if (errorData.errorType && specificErrors?.[errorData.errorType]) {
    throw new Error(specificErrors[errorData.errorType]);
  }

  throw new Error(errorData?.message || defaultMessage);
};

// Helper untuk menangani error form login
export type FormErrors<T> = Partial<Record<keyof T | "general", string>>;

export interface FormErrorData {
  message: string;
  errorType?: string;
  details?: Array<{ message: string; path: string[] }>;
}

// Helper untuk membuat respons error terstruktur
export interface ApiErrorResponse {
  message?: string;
  errorType?: string;
  details?: unknown;
  success?: boolean;
}

export const createErrorResponse = (result: ApiErrorResponse, defaultMessage: string): FormErrorData => {
  // Jika data sudah memiliki format yang tepat untuk FormErrorData
  if (result.details && Array.isArray(result.details)) {
    return {
      message: result.message || defaultMessage,
      errorType: result.errorType,
      details: result.details as Array<{ message: string; path: string[] }>,
    };
  }

  // Jika tidak sesuai format, buat objek error dasar
  return {
    message: result.message || defaultMessage,
    errorType: result.errorType,
    // Mengubah details menjadi format yang diharapkan jika memungkinkan
    details: result.details && !Array.isArray(result.details) ? [] : (result.details as Array<{ message: string; path: string[] }>) || [],
  };
};

export const handleFormErrors = <T extends Record<string, unknown>>(errorData: FormErrorData, fieldMapping: string[], setErrors: (errors: FormErrors<T>) => void): void => {
  if (errorData.errorType === "joiValidationError" && errorData.details && errorData.details.length > 0) {
    const newErrors = {} as FormErrors<T>;

    errorData.details.forEach((detail) => {
      const field = detail.path.find((p) => fieldMapping.includes(p));
      if (field) {
        // Cek apakah field ada dalam T
        if (fieldMapping.includes(field)) {
          (newErrors as Record<string, string>)[field] = detail.message;
        }
      } else {
        newErrors.general = detail.message;
      }
    });

    setErrors(newErrors);
  } else {
    setErrors({ general: errorData.message } as FormErrors<T>);
  }
};
