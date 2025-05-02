import { Eye, Edit, History, Archive, Trash2, FileCog, Pencil, FileSearch } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export enum ActionType {
  VIEW = "view",
  EDIT = "edit",
  LOG = "log",
  ARCHIVE = "archive",
  DELETE = "delete",
  CONFIG = "config",
  CUSTOM = "custom",
}

interface ActionConfig {
  type: ActionType;
  icon?: React.ReactNode;
  title?: string;
  path?: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ActionButtonsProps {
  actions: ActionConfig[];
  entityId?: string;
  basePath?: string;
}

// Map icon berdasarkan tipe aksi
const getDefaultIcon = (type: ActionType) => {
  switch (type) {
    case ActionType.VIEW:
      return <Eye className="h-4 w-4" />;
    case ActionType.EDIT:
      return <Edit className="h-4 w-4" />;
    case ActionType.LOG:
      return <History className="h-4 w-4" />;
    case ActionType.ARCHIVE:
      return <Archive className="h-4 w-4" />;
    case ActionType.DELETE:
      return <Trash2 className="h-4 w-4" />;
    case ActionType.CONFIG:
      return <FileCog className="h-4 w-4" />;
    default:
      return <Pencil className="h-4 w-4" />;
  }
};

// Map style berdasarkan tipe aksi
const getDefaultStyle = (type: ActionType) => {
  switch (type) {
    case ActionType.VIEW:
      return "text-blue-600 hover:text-blue-700 hover:bg-blue-50";
    case ActionType.EDIT:
      return "text-amber-600 hover:text-amber-700 hover:bg-amber-50";
    case ActionType.LOG:
      return "text-green-600 hover:text-green-700 hover:bg-green-50";
    case ActionType.ARCHIVE:
      return "text-red-600 hover:text-red-700 hover:bg-red-50";
    case ActionType.DELETE:
      return "text-red-600 hover:text-red-700 hover:bg-red-50";
    case ActionType.CONFIG:
      return "text-purple-600 hover:text-purple-700 hover:bg-purple-50";
    default:
      return "text-gray-600 hover:text-gray-700 hover:bg-gray-50";
  }
};

// Map title berdasarkan tipe aksi
const getDefaultTitle = (type: ActionType) => {
  switch (type) {
    case ActionType.VIEW:
      return "Lihat Detail";
    case ActionType.EDIT:
      return "Edit";
    case ActionType.LOG:
      return "Log Aktivitas";
    case ActionType.ARCHIVE:
      return "Arsipkan";
    case ActionType.DELETE:
      return "Hapus";
    case ActionType.CONFIG:
      return "Konfigurasi";
    default:
      return "Aksi";
  }
};

// Komponen untuk loading spinner
const LoadingSpinner = () => <div className="h-4 w-4 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>;

export function ActionButtons({ actions, entityId = "", basePath = "" }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      {actions.map((action, index) => {
        const icon = action.icon || getDefaultIcon(action.type);
        const styleClass = action.className || getDefaultStyle(action.type);
        const title = action.title || getDefaultTitle(action.type);

        // Jika ada path, gunakan Link
        if (action.path || (entityId && !action.onClick)) {
          const to = action.path || `${basePath}/${entityId}${action.type === ActionType.EDIT ? "/edit" : action.type === ActionType.LOG ? "/log" : ""}`;

          return (
            <Link key={`${action.type}-${index}`} to={to}>
              <Button size="sm" variant="ghost" className={`h-8 w-8 p-0 ${styleClass}`} title={title} disabled={action.disabled}>
                {icon}
              </Button>
            </Link>
          );
        }

        // Jika ada onClick, gunakan Button biasa
        return (
          <Button key={`${action.type}-${index}`} size="sm" variant="ghost" className={`h-8 w-8 p-0 ${styleClass}`} title={title} onClick={action.onClick} disabled={action.disabled || action.isLoading}>
            {action.isLoading ? <LoadingSpinner /> : icon}
          </Button>
        );
      })}
    </div>
  );
}
