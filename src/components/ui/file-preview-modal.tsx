import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FilePreview } from '@/types/media';
import { Download, Printer, RotateCw, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FilePreview | null;
  // Optional pagination props for nota timbangan
  pagination?: {
    currentIndex: number;
    totalCount: number;
    onNext: () => void;
    onPrevious: () => void;
    itemType?: string; // e.g., "Nota Timbangan"
  };
  // Optional print handler. When provided, a print button is shown. This must
  // print via a sized HTML document (not the PDF in the iframe), otherwise the
  // browser ignores the custom paper size.
  onPrint?: () => void;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  pagination,
  onPrint,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] p-0 overflow-hidden bg-white border-0 shadow-2xl [&>button]:hidden">
        {/* Header - Simplified */}
        <DialogHeader className="px-3 py-2 bg-white border-b border-gray-100 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-sm font-semibold text-gray-900 truncate sm:text-lg">
                {file.name}
              </DialogTitle>
              {pagination && (
                <div className="flex items-center mt-1 text-xs text-gray-500 sm:text-sm">
                  <span>
                    {pagination.itemType || 'Dokumen'} {pagination.currentIndex + 1} dari {pagination.totalCount}
                  </span>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalCount > 1 && (
              <div className="flex items-center mx-2 space-x-1 sm:mx-4 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pagination.onPrevious}
                  disabled={pagination.currentIndex === 0}
                  className="w-8 h-8 p-0 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Dokumen Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pagination.onNext}
                  disabled={pagination.currentIndex >= pagination.totalCount - 1}
                  className="w-8 h-8 p-0 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Dokumen Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Controls - Simplified and responsive */}
            <div className="flex items-center ml-2 space-x-2 sm:ml-4">
              {file.type.includes('image') && (
                <>
                  {/* Mobile: Only essential controls */}
                  <div className="flex items-center space-x-1 sm:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="px-2 text-xs rounded-md h-7 hover:bg-gray-100"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Desktop: Full controls */}
                  <div className="items-center hidden space-x-1 sm:flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="w-8 h-8 p-0 rounded-md hover:bg-gray-100"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="px-2 py-1 bg-gray-50 rounded-md min-w-[3rem] text-center">
                      <span className="text-xs font-medium text-gray-700">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="w-8 h-8 p-0 rounded-md hover:bg-gray-100"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRotate}
                      className="w-8 h-8 p-0 rounded-md hover:bg-gray-100"
                      title="Putar"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-8 px-2 text-xs rounded-md hover:bg-gray-100"
                      title="Reset"
                    >
                      Reset
                    </Button>
                  </div>
                  <div className="hidden w-px h-4 mx-1 bg-gray-200 sm:block" />
                </>
              )}

              {onPrint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrint}
                  className="p-0 transition-colors rounded-md h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50 hover:text-blue-600"
                  title="Cetak"
                >
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="p-0 transition-colors rounded-md h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50 hover:text-blue-600"
                title="Unduh"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-0 transition-colors rounded-md h-7 w-7 sm:h-8 sm:w-8 hover:bg-red-50 hover:text-red-600"
                title="Tutup"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {file.type.includes('image') ? (
            <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] p-4 sm:p-6">
              <div className="relative flex items-center justify-center w-full h-full">
                <img
                  src={file.url}
                  alt={file.name}
                  className="object-contain max-w-full max-h-full transition-all duration-300 ease-in-out bg-white rounded-lg shadow-lg"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                    maxHeight: '60vh',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl shadow-lg border border-gray-200 max-w-sm mx-auto">
                          <div class="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <svg class="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                          </div>
                          <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">Gambar Tidak Dapat Dimuat</h3>
                          <p class="text-sm text-gray-600 mb-2 sm:mb-4">File mungkin rusak atau tidak dapat diakses</p>
                          <p class="text-xs text-gray-500">Coba refresh halaman atau hubungi administrator</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {/* Mobile zoom controls overlay */}
              {file.type.includes('image') && (
                <div className="absolute transform -translate-x-1/2 bottom-4 left-1/2 sm:hidden">
                  <div className="flex items-center px-3 py-2 space-x-2 border border-gray-200 rounded-full shadow-lg bg-white/90 backdrop-blur-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-medium text-gray-700 min-w-[2.5rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRotate}
                      className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : file.type.includes('pdf') ? (
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] p-2 sm:p-8">
              <iframe
                src={file.url}
                title={file.name}
                className="w-full min-h-[300px] h-[50vh] sm:min-h-[400px] sm:h-[70vh] rounded-lg border border-gray-200 shadow-lg bg-white"
                frameBorder="0"
                allowFullScreen
                onError={(e) => {
                  console.error('PDF loading error:', e);
                  const iframe = e.target as HTMLIFrameElement;
                  if (iframe.parentElement) {
                    iframe.parentElement.innerHTML = `
                      <div class="max-w-sm p-6 mx-auto text-center bg-white border border-gray-200 shadow-lg rounded-xl sm:p-12">
                        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full sm:w-20 sm:h-20 bg-red-50 sm:mb-6">
                          <svg class="w-6 h-6 text-red-500 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                          </svg>
                        </div>
                        <h3 class="mb-2 text-sm font-semibold text-gray-900 sm:text-xl sm:mb-3">PDF Tidak Dapat Dimuat</h3>
                        <p class="mb-3 text-xs leading-relaxed text-gray-600 sm:text-sm sm:mb-6">File PDF mungkin rusak atau tidak dapat diakses. Silakan coba unduh file untuk melihat isinya.</p>
                        <button onclick="(function(){ const link = document.createElement('a'); link.href = '${file.url}'; link.download = '${file.name}'; document.body.appendChild(link); link.click(); document.body.removeChild(link); })()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm rounded-lg transition-colors flex items-center justify-center sm:py-2.5">
                          <svg class="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          Unduh PDF
                        </button>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] sm:min-h-[500px] p-4 sm:p-8">
              <div className="max-w-sm p-8 mx-auto text-center bg-white border border-gray-200 shadow-lg rounded-xl sm:p-12">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full sm:w-20 sm:h-20 bg-blue-50 sm:mb-6">
                  <svg
                    className="w-8 h-8 text-blue-500 sm:w-10 sm:h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl sm:mb-3">
                  Preview Tidak Tersedia
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600 sm:mb-6">
                  Preview tidak tersedia untuk tipe file ini. Anda dapat
                  mengunduh file untuk melihat isinya.
                </p>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Unduh File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
