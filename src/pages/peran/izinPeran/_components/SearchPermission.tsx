import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchPermissionProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search permission component for filtering permissions
 */
export const SearchPermission = ({
  value,
  onChange,
}: SearchPermissionProps) => {
  return (
    <div className="relative max-w-full sm:max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder="Cari izin..."
        className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchPermission;
