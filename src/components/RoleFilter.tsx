import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Filter } from "lucide-react";
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

  function handleSelectRole(id: string) {
    // Menyalin semua parameter yang ada
    const params = Object.fromEntries(searchParams.entries());

    // Menangani perubahan roleId
    if (id && id !== "all") {
      params.roleId = id;
    } else {
      delete params.roleId;
    }

    // Reset halaman ke 1
    params.page = "1";

    // Update parameter URL
    setSearchParams(params);
  }

  return (
    <div className="w-[160px] sm:w-[190px]">
      <Select value={roleId || "all"} onValueChange={handleSelectRole} disabled={isLoading}>
        <SelectTrigger className="h-9 w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center">
          <div className="flex items-center">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="truncate">{activeRoleName}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-auto">
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
