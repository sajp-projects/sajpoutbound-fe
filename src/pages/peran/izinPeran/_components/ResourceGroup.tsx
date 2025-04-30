import { Permission } from '@/types/izin';
import { ShieldCheck } from 'lucide-react';
import PermissionCard from './PermissionCard';
import PermissionsTable from './PermissionsTable';

interface ResourceGroupProps {
  resource: string;
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  togglePermission: (id: string) => void;
  isPermissionChanged: (id: string) => boolean;
}

/**
 * Resource group component that groups permissions by resource
 */
export const ResourceGroup = ({
  resource,
  permissions,
  isPermissionSelected,
  togglePermission,
  isPermissionChanged,
}: ResourceGroupProps) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <h3 className="font-medium text-gray-700 flex items-center">
        <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
        <span className="capitalize">{resource}</span>
      </h3>
    </div>

    {/* Table untuk tampilan desktop & tablet */}
    <div className="hidden sm:block">
      <PermissionsTable
        permissions={permissions}
        isPermissionSelected={isPermissionSelected}
        togglePermission={togglePermission}
        isPermissionChanged={isPermissionChanged}
      />
    </div>

    {/* Card untuk tampilan mobile */}
    <div className="sm:hidden space-y-4">
      {permissions.map((permission) => (
        <PermissionCard
          key={permission.id}
          permission={permission}
          isSelected={isPermissionSelected(permission.id)}
          onToggle={togglePermission}
          isChanged={isPermissionChanged(permission.id)}
        />
      ))}
    </div>
  </div>
);

export default ResourceGroup;
