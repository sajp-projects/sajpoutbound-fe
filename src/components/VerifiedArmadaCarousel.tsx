import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { useState } from "react";

interface VerifiedArmada {
  id: string;
  model: string;
  plateNumber: string;
  count: number;
  platePhotos: string[];
}

interface VerifiedArmadaCarouselProps {
  armadas: VerifiedArmada[];
}

export function VerifiedArmadaCarousel({
  armadas,
}: VerifiedArmadaCarouselProps) {
  const [currentArmadaIndex, setCurrentArmadaIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const currentArmada = armadas?.[currentArmadaIndex];
  const currentPhoto = currentArmada?.platePhotos[currentPhotoIndex];

  const nextArmada = () => {
    if (armadas && armadas.length > 0) {
      setCurrentArmadaIndex((prev) => (prev + 1) % armadas.length);
      setCurrentPhotoIndex(0); // Reset to first photo of new armada
    }
  };

  const prevArmada = () => {
    if (armadas && armadas.length > 0) {
      setCurrentArmadaIndex(
        (prev) => (prev - 1 + armadas.length) % armadas.length
      );
      setCurrentPhotoIndex(0); // Reset to first photo of new armada
    }
  };

  const nextPhoto = () => {
    if (currentArmada && currentArmada.platePhotos.length > 1) {
      setCurrentPhotoIndex(
        (prev) => (prev + 1) % currentArmada.platePhotos.length
      );
    }
  };

  const prevPhoto = () => {
    if (currentArmada && currentArmada.platePhotos.length > 1) {
      setCurrentPhotoIndex(
        (prev) =>
          (prev - 1 + currentArmada.platePhotos.length) %
          currentArmada.platePhotos.length
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          Armada Terverifikasi Hari Ini
        </h3>
        {armadas && armadas.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {currentArmadaIndex + 1} / {armadas.length}
            </span>
            {armadas.length > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={prevArmada}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  disabled={armadas.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextArmada}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  disabled={armadas.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">0 / 0</span>
        )}
      </div>

      {/* Container - always visible */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {armadas && armadas.length > 0 && currentArmada ? (
          <>
            {/* Photo Section */}
            {currentPhoto ? (
              <div className="relative h-48 sm:h-64 bg-gray-100">
                <img
                  src={`/public/${currentPhoto}`}
                  alt={`Foto plat ${currentArmada.plateNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-truck.jpg";
                  }}
                />

                {/* Photo Navigation */}
                {currentArmada.platePhotos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {currentArmada.platePhotos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentPhotoIndex
                              ? "bg-white"
                              : "bg-white/50 hover:bg-white/75"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Tidak ada foto plat</p>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {currentArmada.plateNumber}
                  </h4>
                  <p className="text-sm text-gray-600">{currentArmada.model}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Penugasan hari ini</p>
                  <p className="text-lg font-bold text-blue-600">
                    {currentArmada.count}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {currentArmada.platePhotos.length} foto plat tersedia
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Empty state - keep container structure */
          <>
            <div className="h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  Tidak ada armada terverifikasi hari ini
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center text-gray-500">
                <p className="text-sm">Belum ada data armada untuk hari ini</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Armada Navigation Dots - only show when there are armadas */}
      {armadas && armadas.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {armadas.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentArmadaIndex(index);
                setCurrentPhotoIndex(0);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentArmadaIndex
                  ? "bg-blue-600"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
