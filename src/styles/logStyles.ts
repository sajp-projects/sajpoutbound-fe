import { cn } from "@/lib/utils";

// Fungsi bantuan untuk membuat styling konsisten pada semua halaman log
export const logStyles = {
  // Styling untuk tabel
  tableContainer:
    "hidden overflow-hidden border border-gray-200 rounded-lg sm:block",
  tableScroll: "overflow-x-auto",
  tableRowHeader: "border-b border-gray-200 bg-gray-50",
  tableHeaderNo: "w-[50px] font-semibold text-gray-700 py-4",
  tableHeader: "py-4 font-semibold text-gray-700",
  tableRowData: (index: number) =>
    cn(index % 2 === 0 ? "bg-white" : "bg-gray-50"),
  tableCellNo: "font-medium text-center",
  tableCellDate: "text-gray-700",
  tableCellUser: "truncate-text font-medium text-blue-600 hover:underline",
  tableCellPerformedBy: "flex flex-col",
  tableCellName: "font-medium text-blue-600 truncate-text",
  tableCellEmail: "text-xs text-gray-500 truncate-text",
  tableCellDesc: "max-w-xs",
  tableCellDescText: "text-sm text-gray-700 truncate-text-2",

  // Styling untuk kartu mobile
  cardsContainer: "space-y-4 sm:hidden",
  cardItem:
    "overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm",
  cardHeader: "flex items-start justify-between mb-3",
  cardDate: "text-xs text-gray-500",
  cardUserLabel: "text-sm font-medium",
  cardUserLink: "text-sm text-blue-600 hover:underline truncate-text",
  cardDesc: "mb-1 text-sm text-gray-700 truncate-text-2",
  cardPerformedBy: "text-xs text-gray-500",
  cardPerformedByName: "font-medium text-blue-600 truncate-text",

  // Styling untuk tabel detail
  detailContainer: "overflow-x-auto",
  detailTable: "w-full text-xs border-collapse",
  detailFieldHeader: "mb-1 text-xs font-medium text-gray-700",
  detailLabelCell:
    "px-2 py-1 font-medium border border-gray-200 bg-gray-50 w-24",
  detailValueCell: "px-2 py-1 border border-gray-200 detail-table-cell",

  // Styling untuk tabel perubahan
  changeTable: "w-full text-xs border-collapse",
  changeFieldHeader:
    "px-2 py-1 font-medium text-left border border-gray-200 w-20",
  changeValueHeader: "px-2 py-1 font-medium text-left border border-gray-200",
  changeFieldCell: "px-2 py-1 font-medium border border-gray-200",
  changeValueCell: "px-2 py-1 border border-gray-200 detail-table-cell",
};
