import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import {
  PlatePhotoUploadResponse,
  PlateVerificationResponse,
} from "@/types/media";
import { ApiResponse } from "@/types/api";
import { createErrorResponse } from "@/utils/errorHandler";

// Hook untuk upload foto plat nomor
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
          headers: {
            // Hapus Content-Type header untuk FormData agar browser set otomatis dengan boundary
          },
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

// // Hook untuk menghapus foto plat nomor
// export const useDeletePlatePhoto = (options?: {
//   onSuccess?: () => void;
//   onError?: (error: Error) => void;
// }) => {
//   return useMutation({
//     mutationFn: async (shipmentId: string) => {
//       const response = await fetchApi(
//         `/shipments/${shipmentId}/delete-plate-photo`,
//         {},
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         const errorResponse = createErrorResponse(
//           errorData,
//           "Gagal menghapus foto plat nomor"
//         );
//         throw new Error(errorResponse.message);
//       }

//       const result: ApiResponse<{ message: string }> = await response.json();
//       return result.data!;
//     },
//     onSuccess: options?.onSuccess,
//     onError: options?.onError,
//   });
// };

// Hook untuk verifikasi plat nomor
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
