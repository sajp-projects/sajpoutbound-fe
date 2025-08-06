import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Permission } from "@/types/permission";
import { getActionBadgeClass } from "@/utils/badges";
import { formatDate } from "@/utils/date";

interface EditablePermissionsTableProps {
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  onPermissionToggle: (id: string) => void;
}

export const EditablePermissionsTable = ({
  permissions,
  isPermissionSelected,
  onPermissionToggle,
}: EditablePermissionsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-200 bg-gray-50">
          <TableHead className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
            Pilih
          </TableHead>
          <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
            Aksi
          </TableHead>
          <TableHead className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
            Nama Izin
          </TableHead>
          <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
            Deskripsi
          </TableHead>
          <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
            Dibuat
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission, idx) => {
          return (
            <TableRow
              key={permission.id}
              className={cn(
                idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                "border-b border-gray-200 last:border-b-0"
              )}
            >
              <TableCell className="py-2.5 px-3 text-left">
                <div className="flex items-center justify-start">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 bg-gray-100 cursor-pointer focus:ring-2 focus:ring-blue-500"
                    checked={isPermissionSelected(permission.id)}
                    onChange={() => onPermissionToggle(permission.id)}
                    id={`permission-${permission.id}`}
                  />
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-medium text-sm">
                <span
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getActionBadgeClass(permission.action)
                  )}
                >
                  {permission.action}
                </span>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                <div className="wrap-text" title={permission.name}>
                  {permission.name}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                <div className="wrap-text" title={permission.description}>
                  {permission.description}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                {formatDate(permission.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default EditablePermissionsTable;
