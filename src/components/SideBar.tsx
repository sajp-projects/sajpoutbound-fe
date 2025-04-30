import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, Users, ShieldCheck, Package, UserCheck, Warehouse, FileText, Truck, PackageCheck, BarChart3, LogOut, Home, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "@/hooks/auth";

// Tipe dan data
type MenuItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// Data menu
const MENU_ITEMS: MenuItem[] = [
  { name: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/dashboard" },
  {
    name: "Pengguna",
    icon: <Users className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Pengguna", path: "/pengguna" },
      { name: "Tambah Pengguna", path: "/pengguna/tambah" },
      { name: "Arsip Pengguna", path: "/pengguna/arsip" },
    ],
  },
  {
    name: "Peran",
    icon: <ShieldCheck className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Peran", path: "/peran" },
      { name: "Tambah Peran", path: "/peran/tambah" },
    ],
  },
  {
    name: "Barang",
    icon: <Package className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Barang", path: "/barang" },
      { name: "Tambah Barang", path: "/barang/tambah" },
      { name: "Log Barang", path: "/barang/log" },
    ],
  },
  {
    name: "Kustomer",
    icon: <UserCheck className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Kustomer", path: "/kustomer" },
      { name: "Tambah Kustomer", path: "/kustomer/tambah" },
      { name: "Log Kustomer", path: "/kustomer/log" },
    ],
  },
  {
    name: "Gudang",
    icon: <Warehouse className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Gudang", path: "/gudang" },
      { name: "Tambah Gudang", path: "/gudang/tambah" },
      { name: "Log Gudang", path: "/gudang/log" },
    ],
  },
  {
    name: "Delivery Order",
    icon: <FileText className="w-5 h-5" />,
    subItems: [
      { name: "Daftar DO", path: "/do" },
      { name: "Tambah DO", path: "/do/tambah" },
      { name: "DO Arsip", path: "/do/arsip" },
      { name: "Log DO", path: "/do/log" },
    ],
  },
  {
    name: "Armada",
    icon: <Truck className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Armada", path: "/armada" },
      { name: "Tambah Armada", path: "/armada/tambah" },
      { name: "Log Armada", path: "/armada/log" },
    ],
  },
  {
    name: "Pengiriman",
    icon: <PackageCheck className="w-5 h-5" />,
    subItems: [
      { name: "Daftar Pengiriman", path: "/pengiriman" },
      { name: "Tambah Pengiriman", path: "/pengiriman/tambah" },
      { name: "Pengiriman Arsip", path: "/pengiriman/arsip" },
      { name: "Log Pengiriman", path: "/pengiriman/log" },
    ],
  },
  {
    name: "Laporan",
    icon: <BarChart3 className="w-5 h-5" />,
    subItems: [
      { name: "Laporan Gudang", path: "/laporan/gudang" },
      { name: "Laporan Pengiriman", path: "/laporan/pengiriman" },
      { name: "Laporan DO", path: "/laporan/do" },
      { name: "Laporan Armada", path: "/laporan/armada" },
      { name: "Laporan Custom", path: "/laporan/custom" },
    ],
  },
];

export default function SideBar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar?: () => void }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { logout } = useAuth();

  // Render menu
  const renderMenu = () =>
    MENU_ITEMS.map((item) => {
      // Menu tunggal
      if (item.path) {
        return (
          <li key={item.name}>
            <Link to={item.path} className={cn("flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors", location.pathname === item.path && "bg-blue-50 text-blue-600 font-medium")}>
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          </li>
        );
      }

      // Menu dengan submenu
      if (item.subItems) {
        const isOpen = openMenus.includes(item.name);
        const isActive = item.subItems.some((sub) => location.pathname === sub.path);

        return (
          <li key={item.name}>
            <button
              onClick={() => setOpenMenus((prev) => (prev.includes(item.name) ? prev.filter((i) => i !== item.name) : [...prev, item.name]))}
              className={cn("flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors", (isOpen || isActive) && "bg-blue-50 text-blue-600 font-medium")}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "transform rotate-180")} />
            </button>

            <ul className={cn("mt-1 ml-8 space-y-1 overflow-hidden transition-all max-h-0", isOpen && "max-h-96")}>
              {item.subItems.map((sub) => (
                <li key={sub.name}>
                  <Link to={sub.path} className={cn("block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors", location.pathname === sub.path && "bg-blue-50 text-blue-600 font-medium")}>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      }

      return null;
    });

  return (
    <aside className={cn("h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-300 shadow-sm", isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0")}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-5 flex flex-col items-center justify-center border-b border-gray-200 relative">
          {toggleSidebar && (
            <button onClick={toggleSidebar} className="absolute right-2 top-2 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <X className="h-5 w-5" />
            </button>
          )}
          <span className="text-xl font-bold text-blue-600">OUTMANAGE</span>
          <div className="mt-1 text-xs text-gray-500 font-medium">Sistem Manajemen DO</div>
          <div className="w-16 h-1 bg-blue-500 rounded-full mt-3"></div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 overflow-y-auto py-2">
          <ul className="space-y-1">{renderMenu()}</ul>
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 mt-auto border-t border-gray-200">
          <button onClick={logout} className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group w-full text-left">
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
