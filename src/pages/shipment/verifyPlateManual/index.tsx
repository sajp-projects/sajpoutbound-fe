import { Button } from "@/components/ui/button";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import { useManualVerifyPlateNumber } from "@/hooks/media";
import { useUnverifiedShipments } from "@/hooks/shipment";
import { FilePreview } from "@/types/media";
import { Shipment } from "@/types/shipment";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { CheckCircle, Clock, Eye, UserCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function VerifyPlateManualPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch unverified shipments from API
  const {
    data: unverifiedShipments = [],
    isLoading,
    error,
    refetch,
  } = useUnverifiedShipments();

  // Manual verification hook
  const manualVerifyPlateNumber = useManualVerifyPlateNumber({
    onSuccess: () => {
      showSuccessAlert(
        "Berhasil",
        "Plat nomor berhasil diverifikasi secara manual"
      );
      setProcessingId(null);
      refetch(); // Refresh the list
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal",
        error.message ||
          "Terjadi kesalahan saat memverifikasi plat nomor secara manual"
      );
      setProcessingId(null);
    },
  });

  const handleManualVerify = async (shipment: Shipment) => {
    const result = await showConfirmationAlert(
      "Konfirmasi Verifikasi Manual",
      `Apakah Anda yakin ingin memverifikasi kendaraan denganplat nomor ${
        shipment.armada?.plateNumber || shipment.plateNumber
      } secara manual? Verifikasi ini akan menandai pengiriman sebagai terverifikasi tanpa pengecekan AI.`,
      "Ya, Verifikasi",
      "Batal"
    );

    if (isConfirmed(result)) {
      setProcessingId(shipment.id);
      manualVerifyPlateNumber.mutate(shipment.id);
    }
  };

  const handleViewPlatePhoto = (shipment: Shipment) => {
    if (!shipment.platePhoto) return;

    const fileUrl = `/public${shipment.platePhoto}`;
    setPreviewFile({
      url: fileUrl,
      name: "Foto Plat Nomor",
      type: "image/jpeg",
    });
    setPreviewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col px-2 space-y-4 w-full min-h-full sm:space-y-6 sm:px-4 md:px-0">
      {/* Outer Header */}
      <div className="flex flex-row gap-2 justify-between items-center w-full">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
          Verifikasi Plat Manual
        </h1>
      </div>

      {/* Main Content Card */}
      <div className="overflow-hidden p-3 w-full bg-white rounded-lg shadow sm:p-4 md:p-6">
        {/* Inner Header */}
        <div className="flex flex-col gap-3 justify-between items-start mb-4 w-full sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Verifikasi Plat Manual
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Daftar pengiriman yang sudah mengupload foto plat namun belum
              diverifikasi untuk diverifikasi manual.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {unverifiedShipments.length} pengiriman belum diverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Memuat Data
            </h3>
            <p className="text-gray-500">
              Sedang mengambil data pengiriman yang belum diverifikasi...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-500 mb-4">
              Terjadi kesalahan saat mengambil data pengiriman.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        ) : unverifiedShipments.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Semua Pengiriman Sudah Diverifikasi
            </h3>
            <p className="text-gray-500">
              Tidak ada pengiriman yang memerlukan verifikasi manual saat ini.
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unverifiedShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Plate Photo Section */}
                  {shipment.platePhoto && (
                    <div className="relative group">
                      <img
                        src={`/public${shipment.platePhoto}`}
                        alt="Foto Plat Nomor"
                        className="object-cover w-full h-48 transition-all duration-300 cursor-pointer hover:opacity-95 hover:shadow-lg"
                        onClick={() => handleViewPlatePhoto(shipment)}
                        onError={(e) => {
                          console.error(
                            "Error loading image:",
                            e.currentTarget.src
                          );
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex justify-center items-center w-full h-48 bg-gray-100 border-2 border-gray-300 border-dashed">
                                <div class="text-center">
                                  <p class="text-sm text-gray-500">Gambar tidak dapat dimuat</p>
                                  <p class="mt-1 text-xs text-gray-400">Klik untuk melihat detail</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-white/0 rounded-lg opacity-0 group-hover:bg-white/10 group-hover:opacity-100 backdrop-blur-[1px]">
                        <div className="transition-transform duration-300 transform scale-90 group-hover:scale-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-gray-700 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white"
                            onClick={() => handleViewPlatePhoto(shipment)}
                          >
                            <Eye className="mr-2 w-4 h-4" />
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="max-w-[65%]">
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-600 break-words">
                            <Link
                              to={`/pengiriman/${shipment.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {shipment.shipmentNumber}
                            </Link>
                          </div>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            Plat:{" "}
                            {shipment.armada?.plateNumber ||
                              shipment.plateNumber ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs text-gray-500">
                          {shipment.armada?.model || "Kendaraan Eksternal"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                      <p>
                        Customer:{" "}
                        <span className="font-medium">
                          {shipment.shipmentItems?.[0]?.deliveryOrder?.customer
                            ?.name || "N/A"}
                        </span>
                      </p>
                      <p>
                        Items:{" "}
                        <span className="font-medium">
                          {shipment.shipmentItems?.length || 0} items
                        </span>
                      </p>
                      <p>
                        Dibuat:{" "}
                        <span className="font-medium">
                          {formatDate(shipment.createdAt)}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end items-center pt-3 mt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/pengiriman/${shipment.id}`)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="mr-2 w-4 h-4" />
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManualVerify(shipment)}
                        disabled={processingId === shipment.id}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        {processingId === shipment.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            Memverifikasi...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <UserCheck className="mr-2 w-4 h-4" />
                            Verifikasi Manual
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={previewFile}
      />
    </div>
  );
}
