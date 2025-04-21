import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, Users, ShieldCheck, Lock, Package, UserCheck, Warehouse, FileText, Truck, PackageCheck, BarChart3, LogOut, Home, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
}

interface SideBarProps {
  isOpen: boolean;
  toggleSidebar?: () => void;
}

export default function SideBar({ isOpen, toggleSidebar }: SideBarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      path: "/dashboard",
    },
    {
      name: "Pengguna",
      icon: <Users className="w-5 h-5" />,
      subItems: [
        { name: "Daftar Pengguna", path: "/pengguna" },
        { name: "Tambah Pengguna", path: "/pengguna/tambah" },
        { name: "Arsip Pengguna", path: "/pengguna/arsip" },
        { name: "Log Pengguna", path: "/pengguna/log" },
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
      name: "Izin",
      icon: <Lock className="w-5 h-5" />,
      subItems: [
        { name: "Daftar Izin", path: "/izin" },
        { name: "Tambah Izin", path: "/izin/tambah" },
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

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => (prev.includes(menuName) ? prev.filter((item) => item !== menuName) : [...prev, menuName]));
  };

  const isMenuActive = (menuName: string) => {
    return menuItems.find((item) => item.name === menuName)?.subItems?.some((subItem) => location.pathname === subItem.path);
  };

  const isSubMenuActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={cn("h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-300 shadow-sm", isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0")}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header with Logo and Close Button */}
        <div className="px-4 py-5 flex flex-col items-center justify-center border-b border-gray-200 relative">
          {/* Close button for mobile */}
          {toggleSidebar && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="absolute right-2 top-2 p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <span className="text-xl font-bold text-blue-600">OUTMANAGE</span>
          <div className="mt-1 text-xs text-gray-500 font-medium">Sistem Manajemen DO</div>
          <div className="w-16 h-1 bg-blue-500 rounded-full mt-3"></div>
        </div>

        {/* Menu Categories Label */}
        <div className="px-4 py-3 text-xs text-gray-500 font-medium uppercase flex items-center">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-2">Modul Sistem</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto py-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                {item.path ? (
                  <Link to={item.path} className={cn("flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors", location.pathname === item.path && "bg-blue-50 text-blue-600 font-medium")}>
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors",
                        (openMenus.includes(item.name) || isMenuActive(item.name)) && "bg-blue-50 text-blue-600 font-medium"
                      )}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openMenus.includes(item.name) && "transform rotate-180")} />
                    </button>
                    {item.subItems && (
                      <ul className={cn("mt-1 ml-8 space-y-1 overflow-hidden transition-all max-h-0", openMenus.includes(item.name) && "max-h-96")}>
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.path}
                              className={cn("block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors", isSubMenuActive(subItem.path) && "bg-blue-50 text-blue-600 font-medium")}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Actions Section with Divider */}
        <div className="mt-auto">
          <div className="px-4 py-3 text-xs text-gray-500 font-medium uppercase flex items-center">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-2">User</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <div className="px-3 pb-5 pt-1">
            <Link to="/login" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group">
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
              <span className="ml-3">Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
