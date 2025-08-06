import { Permission } from "@/types/permission";
import { ShieldCheck } from "lucide-react";
import EditablePermissionCard from "./EditablePermissionCard";
import EditablePermissionsTable from "./EditablePermissionsTable";

interface EditableResourceGroupProps {
  resource: string;
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  onPermissionToggle: (id: string) => void;
}

export const EditableResourceGroup = ({
  resource,
  permissions,
  isPermissionSelected,
  onPermissionToggle,
}: EditableResourceGroupProps) => (
  <div className="overflow-hidden border border-gray-200 rounded-lg">
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <h3 className="flex items-center font-medium text-gray-700">
        <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
        <span className="capitalize">{resource}</span>
      </h3>
    </div>

    {/* Desktop table view */}
    <div className="hidden sm:block">
      <div className="overflow-x-auto overflow-auto">
        <div className="min-w-[900px]">
          <EditablePermissionsTable
            permissions={permissions}
            isPermissionSelected={isPermissionSelected}
            onPermissionToggle={onPermissionToggle}
          />
        </div>
      </div>
    </div>

    {/* Mobile card view */}
    <div className="space-y-4 sm:hidden">
      {permissions.map((permission) => (
        <EditablePermissionCard
          key={permission.id}
          permission={permission}
          isSelected={isPermissionSelected(permission.id)}
          onToggle={() => onPermissionToggle(permission.id)}
        />
      ))}
    </div>
  </div>
);

export default EditableResourceGroup;
