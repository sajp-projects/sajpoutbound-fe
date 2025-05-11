import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import {
  BarChart3,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Warehouse,
  X,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../lib/utils";
import { getRoleId } from "@/utils/storage";
import { hasPermission } from "@/utils/permission";

interface SubMenuItem {
  name: string;
  path: string;
  action?: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  resource?: string;
  subItems?: SubMenuItem[];
}

interface SideBarProps {
  isOpen: boolean;
  toggleSidebar?: () => void;
}

export default function SideBar({ isOpen, toggleSidebar }: SideBarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const { logout, isAuthenticated } = useAuth();

  const roleId = getRoleId() || "";

  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((item) => item !== menuName)
        : [...prev, menuName]
    );
  };

  const shouldShowMenuItem = (item: MenuItem): boolean => {
    if (!item.resource) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) =>
        hasPermission(
          permissions,
          item.resource!,
          subItem.action || PERMISSION.ACTIONS.READ
        )
      );
    }
    return hasPermission(permissions, item.resource, PERMISSION.ACTIONS.READ);
  };

  const shouldShowSubMenuItem = (
    item: MenuItem,
    subItem: SubMenuItem
  ): boolean => {
    return (
      !item.resource ||
      hasPermission(
        permissions,
        item.resource,
        subItem.action || PERMISSION.ACTIONS.READ
      )
    );
  };

  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      path: "/",
    },
    {
      name: "Pengguna",
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.USER,
      subItems: [
        {
          name: "Daftar Pengguna",
          path: "/pengguna",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Pengguna",
          path: "/pengguna/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Arsip Pengguna",
          path: "/pengguna/arsip",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Log Pengguna",
          path: "/pengguna/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Peran",
      icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.ROLE,
      subItems: [
        {
          name: "Daftar Peran",
          path: "/peran",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Peran",
          path: "/peran/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
      ],
    },
    {
      name: "Izin",
      icon: <Lock className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.PERMISSION,
      subItems: [
        {
          name: "Daftar Izin",
          path: roleId ? `/peran/${roleId}/izin` : "/",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Barang",
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      subItems: [
        {
          name: "Daftar Barang",
          path: "/barang",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Barang",
          path: "/barang/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Log Barang",
          path: "/barang/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Pelanggan",
      icon: <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      subItems: [
        {
          name: "Daftar Pelanggan",
          path: "/pelanggan",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Pelanggan",
          path: "/pelanggan/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Log Pelanggan",
          path: "/pelanggan/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Gudang",
      icon: <Warehouse className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      subItems: [
        {
          name: "Daftar Gudang",
          path: "/gudang",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Gudang",
          path: "/gudang/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Log Gudang",
          path: "/gudang/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Delivery Order",
      icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.DO,
      subItems: [
        {
          name: "Daftar DO",
          path: "/do",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah DO",
          path: "/do/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "DO Arsip",
          path: "/do/arsip",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Log DO",
          path: "/do/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Armada",
      icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.ARMADA,
      subItems: [
        {
          name: "Daftar Armada",
          path: "/armada",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Armada",
          path: "/armada/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Log Armada",
          path: "/armada/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Pengiriman",
      icon: <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      subItems: [
        {
          name: "Daftar Pengiriman",
          path: "/pengiriman",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Tambah Pengiriman",
          path: "/pengiriman/tambah",
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: "Pengiriman Arsip",
          path: "/pengiriman/arsip",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Log Pengiriman",
          path: "/pengiriman/log",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: "Laporan",
      icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      subItems: [
        {
          name: "Laporan Gudang",
          path: "/laporan/gudang",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Laporan Pengiriman",
          path: "/laporan/pengiriman",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Laporan DO",
          path: "/laporan/do",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Laporan Armada",
          path: "/laporan/armada",
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: "Laporan Custom",
          path: "/laporan/custom",
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
  ];

  const isMenuActive = (menuName: string) => {
    return menuItems
      .find((item) => item.name === menuName)
      ?.subItems?.some((subItem) => location.pathname === subItem.path);
  };

  const isSubMenuActive = (path: string) => location.pathname === path;

  if (isLoading) {
    return (
      <aside
        className={cn(
          "h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-200 shadow-sm",
          isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
        )}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-6 h-6 border-b-2 border-blue-500 rounded-full animate-spin sm:h-8 sm:w-8"></div>
          <span className="mt-2 text-xs text-gray-500 sm:text-sm">
            Loading...
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-200 shadow-sm",
        isOpen
          ? "w-64 translate-x-0"
          : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="relative flex flex-col items-center justify-center px-3 py-3 border-b border-gray-200 sm:px-4 sm:py-5">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="absolute right-1 sm:right-2 top-1 sm:top-2 p-1.5 sm:p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 sm:h-5 sm:w-5" />
            </button>
          )}

          <span className="text-lg font-bold text-blue-600 sm:text-xl">
            OUTMANAGE
          </span>
          <div className="mt-1 text-xs font-medium text-gray-500">
            Sistem Manajemen DO
          </div>
          <div className="w-12 h-1 mt-2 bg-blue-500 rounded-full sm:w-16 sm:mt-3"></div>
        </div>

        <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase sm:px-4 sm:py-3">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="px-2">Modul Sistem</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        <nav className="flex-1 px-2 py-2 overflow-y-auto sm:px-3">
          <ul className="space-y-1">
            {menuItems.map(
              (item) =>
                shouldShowMenuItem(item) && (
                  <li key={item.name}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs sm:text-sm",
                          location.pathname === item.path &&
                            "bg-blue-50 text-blue-600 font-medium"
                        )}
                      >
                        {item.icon}
                        <span className="ml-2 sm:ml-3">{item.name}</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={cn(
                            "flex items-center justify-between w-full px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs sm:text-sm",
                            (openMenus.includes(item.name) ||
                              isMenuActive(item.name)) &&
                              "bg-blue-50 text-blue-600 font-medium"
                          )}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-2 sm:ml-3">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-3 h-3 sm:w-4 sm:h-4 transition-transform",
                              openMenus.includes(item.name) &&
                                "transform rotate-180"
                            )}
                          />
                        </button>
                        {item.subItems && (
                          <ul
                            className={cn(
                              "mt-1 ml-6 sm:ml-8 space-y-0.5 sm:space-y-1 overflow-hidden transition-all max-h-0",
                              openMenus.includes(item.name) && "max-h-96"
                            )}
                          >
                            {item.subItems.map(
                              (subItem) =>
                                shouldShowSubMenuItem(item, subItem) && (
                                  <li key={subItem.name}>
                                    <Link
                                      to={subItem.path}
                                      className={cn(
                                        "block px-2 sm:px-3 py-1 sm:py-2 text-xs text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors",
                                        isSubMenuActive(subItem.path) &&
                                          "bg-blue-50 text-blue-600 font-medium"
                                      )}
                                    >
                                      {subItem.name}
                                    </Link>
                                  </li>
                                )
                            )}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                )
            )}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-500 uppercase sm:px-4 sm:py-3">
            <div className="flex-grow h-px bg-gray-200"></div>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <div className="px-2 pt-1 pb-4 sm:px-3 sm:pb-5">
            <button
              onClick={logout}
              className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group w-full text-left text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4 text-gray-500 sm:w-5 sm:h-5 group-hover:text-red-500" />
              <span className="ml-2 sm:ml-3">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
