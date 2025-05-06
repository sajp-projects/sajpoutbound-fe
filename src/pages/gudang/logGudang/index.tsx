import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useWarehouse } from "@/hooks/gudang";
import { useWarehouseLogsByWarehouseId } from "@/hooks/gudangLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { Pagination } from "@/components/Pagination";
import { LoadingState } from "@/components/LoadingState";

export default function LogGudang() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");
  const warehouseId = id || "";

  
  const { data: gudangData, isLoading: gudangLoading } = useWarehouse({ id: warehouseId }, { enabled: !!warehouseId });

  const { data, isLoading } = useWarehouseLogsByWarehouseId(warehouseId, {
    enabled: !!warehouseId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  
  const getActionLabel = (action: string) => {
    const labels = {
      CREATE: { label: "Dibuat", color: "bg-green-100 text-green-800 border-green-200" },
      UPDATE: { label: "Diperbarui", color: "bg-amber-100 text-amber-800 border-amber-200" },
      DELETE: { label: "Dihapus", color: "bg-red-100 text-red-800 border-red-200" },
      RESTORE: { label: "Dipulihkan", color: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    return labels[action as keyof typeof labels] || { label: action, color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  
  const renderChanges = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData && !newData) return null;

    
    if (newData && !oldData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dibuat:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{newData.name as string}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{newData.description as string}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    
    if (oldData && !newData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dihapus:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.name as string}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.description as string}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    
    if (oldData && newData) {
      const changes = [];
      if (oldData.name !== newData.name) {
        changes.push({ field: "Nama", oldValue: oldData.name as string, newValue: newData.name as string });
      }
      if (oldData.description !== newData.description) {
        changes.push({ field: "Deskripsi", oldValue: oldData.description as string, newValue: newData.description as string });
      }

      const oldUser = oldData.user ? ((oldData.user as Record<string, unknown>).name as string) : "-";
      const newUser = newData.user ? ((newData.user as Record<string, unknown>).name as string) : "-";
      if (oldUser !== newUser) {
        changes.push({ field: "Pengelola", oldValue: oldUser, newValue: newUser });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Perubahan:</div>
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Field</th>
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Nilai Lama</th>
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Nilai Baru</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-200 px-2 py-1 font-medium">{change.field}</td>
                  <td className="border border-gray-200 px-2 py-1">{change.oldValue}</td>
                  <td className="border border-gray-200 px-2 py-1">{change.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  
  const LogList = () => (
    <>
      {}
      <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">No</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Waktu</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Aksi</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Dilakukan Oleh</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                    <Search className="h-10 w-10 mb-2 text-gray-300" />
                    <p className="text-gray-500">Tidak ada data log yang ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.id} className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                  <TableCell className="font-medium text-center">{index + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                  <TableCell className="text-gray-700">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                      <span className="text-xs text-gray-500">{log.performedBy.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
                    {(log.oldData || log.newData) && (
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="px-2 py-1 h-auto text-xs text-blue-600 hover:text-blue-800" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle("hidden")}>
                          Lihat Detail
                        </Button>
                        <div className="hidden mt-2">{renderChanges(log.oldData, log.newData)}</div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {}
      <div className="sm:hidden space-y-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
            <Search className="h-10 w-10 mb-2 text-gray-300" />
            <p className="text-gray-500">Tidak ada data log yang ditemukan.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                  <span className="text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-1">{log.description}</p>
                  <div className="text-xs text-gray-500">
                    Dilakukan oleh: <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                  </div>
                </div>
                {(log.oldData || log.newData) && <div className="mt-3 border-t border-gray-100 pt-3">{renderChanges(log.oldData, log.newData)}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      {}
      {data && <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />}
    </>
  );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/gudang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas Gudang</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        {gudangLoading ? (
          <LoadingState text="Memuat data gudang..." height="h-20" />
        ) : !gudangData ? (
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <p className="text-amber-600 font-medium">Peringatan: ID gudang tidak ditemukan</p>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Log Aktivitas: {gudangData.name}</h2>
            <p className="text-sm text-gray-500">{gudangData.description}</p>
          </div>
        )}

        {isLoading ? <LoadingState text="Memuat data log..." /> : <LogList />}
      </div>
    </div>
  );
}
