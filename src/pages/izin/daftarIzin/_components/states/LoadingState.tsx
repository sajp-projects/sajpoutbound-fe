/**
 * Loading state component for permission page
 */
export const LoadingState = () => (
  <div className="flex justify-center items-center h-60">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      <p className="mt-4 text-blue-600 font-medium">Memuat data izin...</p>
    </div>
  </div>
);

export default LoadingState;
