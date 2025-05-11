import { Info } from "lucide-react";

interface InfoBannerProps {
  title: string;
  message: string;
}

export const InfoBanner = ({ title, message }: InfoBannerProps) => {
  return (
    <div className="p-4 mb-6 border border-blue-200 rounded-md bg-blue-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="w-5 h-5 text-blue-500" />
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
