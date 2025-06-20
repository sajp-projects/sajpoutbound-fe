import { Loader2 } from "lucide-react";

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse border-t-transparent"></div>
      </div>
      <div className="text-center">
        <h3 className="mb-1 text-lg font-semibold text-gray-800">
          Memuat halaman...
        </h3>
        <p className="text-sm text-gray-600">Mohon tunggu sebentar</p>
      </div>
    </div>
  </div>
);

export default LoadingFallback;
