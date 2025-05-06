import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Izin Peran</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola izin akses untuk peran:{' '}
          <span className="font-medium text-blue-600">{roleName || '...'}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Link to={`/peran/${roleId}`}>
          <Button variant="outline" className="border-gray-300 text-gray-700">
            Kembali
          </Button>
        </Link>
        <Button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting || !hasChanges}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          {hasChanges && !isSubmitting && (
            <span className="ml-1.5 flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
