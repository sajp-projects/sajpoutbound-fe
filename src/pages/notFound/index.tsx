import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-white">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-500-foreground">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah
          dipindahkan.
        </p>
        <div className="flex flex-col justify-center gap-3 mt-8 sm:flex-row">
          <Button onClick={() => navigate(-1)} variant="outline">
            Kembali
          </Button>
          <Button onClick={() => navigate("/")} variant="default">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
