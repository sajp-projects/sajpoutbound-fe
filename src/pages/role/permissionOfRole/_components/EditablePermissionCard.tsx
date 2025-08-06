import { cn } from "@/lib/utils";
import { Permission } from "@/types/permission";
import { getActionBadgeClass } from "@/utils/badges";
import { formatDateShort } from "@/utils/date";
import { Check } from "lucide-react";

interface EditablePermissionCardProps {
  permission: Permission;
  isSelected: boolean;
  onToggle: () => void;
}

export const EditablePermissionCard = ({
  permission,
  isSelected,
  onToggle,
}: EditablePermissionCardProps) => {
  return (
    <div className="border-b border-gray-100 last:border-0 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-blue-600 bg-gray-100 cursor-pointer focus:ring-2 focus:ring-blue-500"
            checked={isSelected}
            onChange={onToggle}
            id={`mobile-permission-${permission.id}`}
          />
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getActionBadgeClass(permission.action)
            )}
          >
            {permission.action}
          </span>
        </div>

        {isSelected && (
          <span className="p-1 text-green-600 rounded-full bg-green-50">
            <Check className="w-4 h-4" />
          </span>
        )}
      </div>

      <h4 className="mb-1 font-medium text-blue-600">{permission.name}</h4>
      <p className="mb-2 text-sm text-gray-600">{permission.description}</p>

      <div className="text-xs text-gray-500">
        Dibuat:{" "}
        <span className="font-medium">
          {formatDateShort(permission.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default EditablePermissionCard;
