import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { useAllRoles } from "@/hooks/role";

export function RoleFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleId = searchParams.get("roleId") || "";

  const { data, isLoading } = useAllRoles({
    staleTime: 5 * 60 * 1000,
  });

  const roles = data?.roles || [];
  const activeRoleName =
    roles.find((role) => role.id === roleId)?.name || "Semua Peran";

  function handleSelectRole(id: string) {
    const params = Object.fromEntries(searchParams.entries());

    if (id && id !== "all") {
      params.roleId = id;
    } else {
      delete params.roleId;
    }

    params.page = "1";
    setSearchParams(params);
  }

  return (
    <div className="w-[160px] sm:w-[190px]">
      <Select
        value={roleId || "all"}
        onValueChange={handleSelectRole}
        disabled={isLoading}
      >
        <SelectTrigger className="flex items-center w-full text-xs text-gray-700 bg-white border-gray-300 h-9 hover:bg-gray-50 sm:text-sm">
          <div className="flex items-center">
            <Filter className="w-3 h-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="truncate">{activeRoleName}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white border border-gray-300 rounded-md overflow-auto">
          <SelectItem
            value="all"
            className={cn(!roleId && "font-medium text-blue-600")}
          >
            Semua Peran
          </SelectItem>
          {roles.map((role) => (
            <SelectItem
              key={role.id}
              value={role.id}
              className={cn(role.id === roleId && "font-medium  text-blue-600")}
            >
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
