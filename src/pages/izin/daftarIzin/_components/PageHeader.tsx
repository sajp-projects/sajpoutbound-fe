import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface PageHeaderProps {
  roleName: string;
  roleId: string;
}

export const PageHeader = ({
  roleName,
  roleId,
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
      <div>
        <Link to={`/peran/${roleId}`}>
          <Button variant="outline" className="text-gray-700 border-gray-300">
            Kembali
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;
