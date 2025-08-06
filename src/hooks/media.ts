import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import {
  PlatePhotoUploadResponse,
  PlateVerificationResponse,
} from "@/types/media";
import { ApiResponse } from "@/types/api";
import { createErrorResponse } from "@/utils/errorHandler";

export const useUploadPlatePhoto = (options?: {
  onSuccess?: (data: PlatePhotoUploadResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: async ({
      shipmentId,
      file,
    }: {
      shipmentId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("platePhoto", file);

      const response = await fetchApi(
        `/shipments/${shipmentId}/upload-plate-photo`,
        {},
        {
          method: "PATCH",
          body: formData,
          headers: {},
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Upload error:", response.status, errorData);
        const errorResponse = createErrorResponse(
          errorData,
          "Gagal mengupload foto plat nomor"
        );
        throw new Error(errorResponse.message);
      }

      const result: ApiResponse<PlatePhotoUploadResponse> =
        await response.json();
      return result.data!;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useVerifyPlateNumber = (options?: {
  onSuccess?: (data: PlateVerificationResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: async (shipmentId: string) => {
      const response = await fetchApi(
        `/shipments/${shipmentId}/verify-plate`,
        {},
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorResponse = createErrorResponse(
          errorData,
          "Gagal memverifikasi plat nomor"
        );
        throw new Error(errorResponse.message);
      }

      const result: ApiResponse<PlateVerificationResponse> =
        await response.json();
      return result.data!;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useManualVerifyPlateNumber = (options?: {
  onSuccess?: (data: PlateVerificationResponse) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: async (shipmentId: string) => {
      const response = await fetchApi(
        `/shipments/${shipmentId}/verify-plate-manual`,
        {},
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorResponse = createErrorResponse(
          errorData,
          "Gagal memverifikasi plat nomor secara manual"
        );
        throw new Error(errorResponse.message);
      }

      const result: ApiResponse<PlateVerificationResponse> =
        await response.json();
      return result.data!;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
