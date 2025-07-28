import { Permission } from "@/types/izin";
import { ShieldCheck } from "lucide-react";
import PermissionCard from "./PermissionCard";
import PermissionsTable from "./PermissionsTable";

interface ResourceGroupProps {
  resource: string;
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
}

export const ResourceGroup = ({
  resource,
  permissions,
  isPermissionSelected,
}: ResourceGroupProps) => (
  <div className="overflow-hidden border border-gray-200 rounded-lg">
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <h3 className="flex items-center font-medium text-gray-700">
        <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" />
        <span className="capitalize">{resource}</span>
      </h3>
    </div>

    {}
    <div className="hidden sm:block">
      <div className="overflow-x-auto overflow-auto  ">
        <div className="min-w-[900px]">
          <PermissionsTable
            permissions={permissions}
            isPermissionSelected={isPermissionSelected}
          />
        </div>
      </div>
    </div>

    {}
    <div className="space-y-4 sm:hidden">
      {permissions.map((permission) => (
        <PermissionCard
          key={permission.id}
          permission={permission}
          isSelected={isPermissionSelected(permission.id)}
        />
      ))}
    </div>
  </div>
);

export default ResourceGroup;
