import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils";
import { useRoles } from "@/hooks/role";

export function RoleFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleId = searchParams.get("roleId") || "";

  const { data, isLoading } = useRoles({
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const roles = data?.roles || [];

  // Mendapatkan nama role yang aktif
  const activeRole = roles.find((role) => role.id === roleId);
  const activeRoleName = activeRole ? activeRole.name : "Semua Peran";

  const handleSelectRole = useCallback(
    (id: string) => {
      const newParams = new URLSearchParams(searchParams);

      if (id && id !== "all") {
        newParams.set("roleId", id);
      } else {
        newParams.delete("roleId");
      }

      // Reset ke halaman pertama saat filter berubah
      newParams.set("page", "1");

      setSearchParams(newParams, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="w-[160px] sm:w-[190px]">
      <Select value={roleId || "all"} onValueChange={handleSelectRole} disabled={isLoading}>
        <SelectTrigger className="h-9 w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center">
          <div className="flex items-center">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="truncate">{activeRoleName}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className={cn(!roleId && "font-medium text-blue-600")}>
            Semua Peran
          </SelectItem>

          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id} className={cn(role.id === roleId && "font-medium text-blue-600")}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
