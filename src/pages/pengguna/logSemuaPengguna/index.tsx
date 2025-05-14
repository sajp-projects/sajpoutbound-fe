import { useSearchParams } from "react-router";
import { Download } from "lucide-react";

import { useAllUserLogs } from "@/hooks/userLog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { Pagination } from "@/components/Pagination";
import { Link } from "react-router";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { logStyles } from "@/styles/logStyles";

interface UserLog {
  id: string;
  createdAt: string;
  action: string;
  description: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  performedBy: {
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

interface ActionLabel {
  label: string;
  color: string;
}

export default function LogSemuaPengguna() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading } = useAllUserLogs({
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

  const getActionLabel = (action: string): ActionLabel => {
    const labels: Record<string, ActionLabel> = {
      CREATE: {
        label: "Dibuat",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      UPDATE: {
        label: "Diperbarui",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      DELETE: {
        label: "Diarsipkan",
        color: "bg-red-100 text-red-800 border-red-200",
      },
      RESTORE: {
        label: "Dipulihkan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    return (
      labels[action] || {
        label: action,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
  };

  const renderChanges = (
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
  ) => {
    if (!oldData && !newData) return null;

    if (newData && !oldData) {
      return (
        <div>
          <div className={logStyles.detailFieldHeader}>
            Data pengguna yang dibuat:
          </div>
          <div className={logStyles.detailContainer}>
            <table className={logStyles.detailTable}>
              <tbody>
                <tr>
                  <td className={logStyles.detailLabelCell}>Nama</td>
                  <td className={logStyles.detailValueCell}>
                    {newData.name as string}
                  </td>
                </tr>
                <tr>
                  <td className={logStyles.detailLabelCell}>Email</td>
                  <td className={logStyles.detailValueCell}>
                    {newData.email as string}
                  </td>
                </tr>
                <tr>
                  <td className={logStyles.detailLabelCell}>Peran</td>
                  <td className={logStyles.detailValueCell}>
                    {newData.roleId as string}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (
      (oldData && !newData) ||
      (oldData && newData && oldData.deletedAt !== newData.deletedAt)
    ) {
      const isRestore = newData?.deletedAt === null;
      return (
        <div>
          <div className={logStyles.detailFieldHeader}>
            {isRestore
              ? "Pengguna dipulihkan:"
              : "Data pengguna yang diarsipkan:"}
          </div>
          {oldData && (
            <div className={logStyles.detailContainer}>
              <table className={logStyles.detailTable}>
                <tbody>
                  <tr>
                    <td className={logStyles.detailLabelCell}>Status</td>
                    <td className={logStyles.detailValueCell}>
                      {isRestore ? "Dipulihkan" : "Diarsipkan"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (oldData && newData) {
      const changes = [];

      if (oldData.name !== newData.name) {
        changes.push({
          field: "Nama",
          oldValue: oldData.name as string,
          newValue: newData.name as string,
        });
      }

      if (oldData.email !== newData.email) {
        changes.push({
          field: "Email",
          oldValue: oldData.email as string,
          newValue: newData.email as string,
        });
      }

      if (oldData.roleId !== newData.roleId) {
        changes.push({
          field: "Peran",
          oldValue: oldData.roleId as string,
          newValue: newData.roleId as string,
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className={logStyles.detailFieldHeader}>Perubahan:</div>
          <div className={logStyles.detailContainer}>
            <table className={logStyles.changeTable}>
              <thead>
                <tr className="bg-gray-50">
                  <th className={logStyles.changeFieldHeader}>Field</th>
                  <th className={logStyles.changeValueHeader}>Nilai Lama</th>
                  <th className={logStyles.changeValueHeader}>Nilai Baru</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, idx) => (
                  <tr key={idx}>
                    <td className={logStyles.changeFieldCell}>
                      {change.field}
                    </td>
                    <td className={logStyles.changeValueCell}>
                      {change.oldValue}
                    </td>
                    <td className={logStyles.changeValueCell}>
                      {change.newValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderLogTable = () => (
    <div className={logStyles.tableContainer}>
      <div className={logStyles.tableScroll}>
        <Table>
          <TableHeader>
            <TableRow className={logStyles.tableRowHeader}>
              <TableHead className={logStyles.tableHeaderNo}>No</TableHead>
              <TableHead className={logStyles.tableHeader}>Waktu</TableHead>
              <TableHead className={logStyles.tableHeader}>Pengguna</TableHead>
              <TableHead className={logStyles.tableHeader}>Aksi</TableHead>
              <TableHead className={logStyles.tableHeader}>
                Dilakukan Oleh
              </TableHead>
              <TableHead className={logStyles.tableHeader}>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <EmptyState
                    title="Tidak ada data log yang ditemukan."
                    message=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: UserLog, index: number) => (
                <TableRow
                  key={log.id}
                  className={logStyles.tableRowData(index)}
                >
                  <TableCell className={logStyles.tableCellNo}>
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </TableCell>
                  <TableCell className={logStyles.tableCellDate}>
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    {log.user && (
                      <Link
                        to={`/pengguna/${log.user.id}`}
                        className={logStyles.tableCellUser}
                      >
                        {log.user.name}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md font-medium border",
                        getActionLabel(log.action).color
                      )}
                    >
                      {getActionLabel(log.action).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={logStyles.tableCellPerformedBy}>
                      <span className={logStyles.tableCellName}>
                        {log.performedBy.name}
                      </span>
                      <span className={logStyles.tableCellEmail}>
                        {log.performedBy.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={logStyles.tableCellDesc}>
                    <p className={logStyles.tableCellDescText}>
                      {log.description}
                    </p>
                    <div className="mt-2">
                      {(log.oldData || log.newData) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.currentTarget.nextElementSibling?.classList.toggle(
                                "hidden"
                              );
                            }}
                          >
                            Lihat Detail
                          </Button>
                          <div className="hidden mt-2">
                            {renderChanges(log.oldData, log.newData)}
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderLogCards = () => (
    <div className={logStyles.cardsContainer}>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
          <EmptyState title="Tidak ada data log yang ditemukan." message="" />
        </div>
      ) : (
        logs.map((log: UserLog) => (
          <div key={log.id} className={logStyles.cardItem}>
            <div className="p-4">
              <div className={logStyles.cardHeader}>
                <Badge
                  className={cn(
                    "rounded-md font-medium border",
                    getActionLabel(log.action).color
                  )}
                >
                  {getActionLabel(log.action).label}
                </Badge>
                <span className={logStyles.cardDate}>
                  {formatDateShort(log.createdAt)}
                </span>
              </div>

              <div className="mb-2">
                {log.user && (
                  <div className="mb-1">
                    <span className={logStyles.cardUserLabel}>Pengguna: </span>
                    <Link
                      to={`/pengguna/${log.user.id}`}
                      className={logStyles.cardUserLink}
                    >
                      {log.user.name}
                    </Link>
                  </div>
                )}
                <p className={logStyles.cardDesc}>{log.description}</p>
                <div className={logStyles.cardPerformedBy}>
                  Dilakukan oleh:{" "}
                  <span className={logStyles.cardPerformedByName}>
                    {log.performedBy.name}
                  </span>
                </div>
              </div>

              {(log.oldData || log.newData) && (
                <div className="pt-3 mt-3 border-t border-gray-100">
                  {renderChanges(log.oldData, log.newData)}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Pengguna
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Semua Aktivitas Pengguna
            </h2>
            <p className="text-sm text-gray-500">
              Riwayat perubahan data pengguna di sistem
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-3 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 min-w-[100px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center px-3"
            >
              <Download className="w-3 h-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data log..." />
        ) : (
          <div>
            {renderLogTable()}
            {renderLogCards()}
            {data && (
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
