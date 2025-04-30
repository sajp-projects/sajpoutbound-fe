import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Permission } from '@/types/izin';
import { getActionBadgeClass } from '@/utils/badges';
import { formatDate } from '@/utils/date';

interface PermissionsTableProps {
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  togglePermission: (id: string) => void;
  isPermissionChanged: (id: string) => boolean;
}

/**
 * Permissions table component for desktop view
 */
export const PermissionsTable = ({
  permissions,
  isPermissionSelected,
  togglePermission,
  isPermissionChanged,
}: PermissionsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="w-[50px] font-semibold text-gray-700 py-3">
              Pilih
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Aksi
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Nama Izin
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Deskripsi
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-3">
              Dibuat
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-3 w-[100px]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission, idx) => {
            const wasChanged = isPermissionChanged(permission.id);
            return (
              <TableRow
                key={permission.id}
                className={cn(
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                  wasChanged && 'bg-blue-50/70'
                )}
              >
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className={cn(
                        'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                        wasChanged && 'ring-2 ring-blue-400'
                      )}
                      checked={isPermissionSelected(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      id={`permission-${permission.id}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getActionBadgeClass(permission.action)
                    )}
                  >
                    {permission.action}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {permission.name}
                </TableCell>
                <TableCell className="text-gray-600">
                  {permission.description}
                </TableCell>
                <TableCell className="hidden md:table-cell text-gray-500">
                  {formatDate(permission.createdAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {wasChanged && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                      Diubah
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsTable;
