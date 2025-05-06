import { cn } from '@/lib/utils';
import { Permission } from '@/types/izin';
import { getActionBadgeClass } from '@/utils/badges';
import { formatDateShort } from '@/utils/date';
import { Check } from 'lucide-react';

interface PermissionCardProps {
  permission: Permission;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isChanged: boolean;
}


export const PermissionCard = ({
  permission,
  isSelected,
  onToggle,
  isChanged,
}: PermissionCardProps) => {
  return (
    <div
      className={`border-b border-gray-100 last:border-0 p-4 ${
        isChanged ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              isChanged ? 'ring-2 ring-blue-400' : ''
            }`}
            checked={isSelected}
            onChange={() => onToggle(permission.id)}
            id={`mobile-permission-${permission.id}`}
          />
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getActionBadgeClass(permission.action)
            )}
          >
            {permission.action}
          </span>
        </div>

        {isSelected && (
          <span className="text-green-600 bg-green-50 p-1 rounded-full">
            <Check className="h-4 w-4" />
          </span>
        )}

        {isChanged && (
          <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full ml-1">
            Diubah
          </span>
        )}
      </div>

      <h4 className="font-medium text-blue-600 mb-1">{permission.name}</h4>
      <p className="text-sm text-gray-600 mb-2">{permission.description}</p>

      <div className="text-xs text-gray-500">
        Dibuat:{' '}
        <span className="font-medium">
          {formatDateShort(permission.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default PermissionCard;
