import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface PageHeaderProps {
  roleName: string;
  roleId: string;
  onSave: () => void;
  isSubmitting: boolean;
  hasChanges: boolean;
}

export const PageHeader = ({
  roleName,
  roleId,
  onSave,
  isSubmitting,
  hasChanges,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Izin Peran</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola izin akses untuk peran:{" "}
          <span className="font-medium text-blue-600">{roleName || "..."}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Link to={`/peran/${roleId}`}>
          <Button variant="outline" className="text-gray-700 border-gray-300">
            Kembali
          </Button>
        </Link>
        <Button
          onClick={onSave}
          className="text-white bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          {hasChanges && !isSubmitting && (
            <span className="ml-1.5 flex h-2 w-2 relative">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-white/80"></span>
              <span className="relative inline-flex w-2 h-2 bg-white rounded-full"></span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
