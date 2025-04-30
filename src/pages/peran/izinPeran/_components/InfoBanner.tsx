import { Info } from 'lucide-react';

interface InfoBannerProps {
  title: string;
  message: string;
}

/**
 * Info banner component for displaying helpful information
 */
export const InfoBanner = ({ title, message }: InfoBannerProps) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;
