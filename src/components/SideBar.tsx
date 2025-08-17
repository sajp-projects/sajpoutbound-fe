import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/permission";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  BarChart3,
  ChevronDown,
  FileText,
  Home,
  Lock,
  LogOut,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
  User,
  UserCheck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "../lib/utils";

interface SubMenuItem {
  name: string;
  path: string;
  action?: string;
  resource?: string;
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
  const { logout, logoutMutation, isAuthenticated } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);

  const roleId = getRoleId() || "";

  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(menuName)) {
        return [];
      }
      return [menuName];
    });
  };

  const handleLinkClick = () => {
    if (toggleSidebar && isMobileView) {
      toggleSidebar();
    }
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
    const resource = subItem.resource || item.resource;
    return (
      !resource ||
      hasPermission(
        permissions,
        resource,
        subItem.action || PERMISSION.ACTIONS.READ
      )
    );
  };

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        name: "Dashboard",
        icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
        path: "/",
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
            resource: PERMISSION.RESOURCES.ARMADA_LOG,
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
            action: PERMISSION.ACTIONS.READ_ARCHIVED,
          },
          {
            name: "Log DO",
            path: "/do/log",
            action: PERMISSION.ACTIONS.READ,
            resource: PERMISSION.RESOURCES.DO_LOG,
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
            action: PERMISSION.ACTIONS.READ_ARCHIVED,
          },
          {
            name: "Log Pengiriman",
            path: "/pengiriman/log",
            action: PERMISSION.ACTIONS.READ,
            resource: PERMISSION.RESOURCES.PENGIRIMAN_LOG,
          },
          {
            name: "Verifikasi Plat Manual",
            path: "/pengiriman/verifikasi-plat-manual",
            action: PERMISSION.ACTIONS.VERIFY_PLATE_MANUAL,
          },
        ],
      },
      {
        name: "Supir",
        icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />,
        resource: PERMISSION.RESOURCES.DRIVER,
        subItems: [
          {
            name: "Daftar Supir",
            path: "/supir",
            action: PERMISSION.ACTIONS.READ,
          },
          {
            name: "Tambah Supir",
            path: "/supir/tambah",
            action: PERMISSION.ACTIONS.CREATE,
          },
        ],
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
            action: PERMISSION.ACTIONS.READ_ARCHIVED,
          },
          {
            name: "Log Pengguna",
            path: "/pengguna/log",
            action: PERMISSION.ACTIONS.READ,
            resource: PERMISSION.RESOURCES.USER_LOG,
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
            path: "/izin",
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
            resource: PERMISSION.RESOURCES.PRODUCT_LOG,
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
            resource: PERMISSION.RESOURCES.CUSTOMER_LOG,
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
            resource: PERMISSION.RESOURCES.WAREHOUSE_LOG,
          },
        ],
      },
      {
        name: "Laporan",
        icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />,
        resource: PERMISSION.RESOURCES.LAPORAN,
        subItems: [
          {
            name: "Operasional",
            path: "/laporan/operasional",
            action: PERMISSION.ACTIONS.READ,
          },
          {
            name: "Pengeluaran",
            path: "/laporan/pengeluaran",
            action: PERMISSION.ACTIONS.READ,
          },
          {
            name: "Penugasan Pengiriman",
            path: "/laporan/penugasan",
            action: PERMISSION.ACTIONS.READ,
          },
        ],
      },
    ],
    []
  );

  const getActiveMenuName = useCallback(() => {
    const currentPath = location.pathname;

    for (const item of menuItems) {
      if (item.subItems) {
        const isActive = item.subItems.some((subItem) => {
          return (
            currentPath === subItem.path ||
            (subItem.path !== "/" && currentPath.startsWith(subItem.path + "/"))
          );
        });

        if (isActive) {
          return item.name;
        }
      } else if (item.path === currentPath) {
        return item.name;
      }
    }
    return null;
  }, [location.pathname, menuItems]);

  useEffect(() => {
    const activeMenu = getActiveMenuName();
    if (activeMenu) {
      setOpenMenus([activeMenu]);
    }
  }, [location.pathname, getActiveMenuName]);

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
            PT. SAJP
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
                        onClick={handleLinkClick}
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
                              "mt-2 ml-6 sm:ml-8 space-y-1 sm:space-y-1 overflow-hidden transition-all max-h-0 border-l border-gray-200 pl-3 sm:pl-4",
                              openMenus.includes(item.name) && "max-h-96"
                            )}
                          >
                            {item.subItems.map(
                              (subItem) =>
                                shouldShowSubMenuItem(item, subItem) && (
                                  <li key={subItem.name}>
                                    <Link
                                      to={subItem.path}
                                      onClick={() => {
                                        handleLinkClick();
                                      }}
                                      className={cn(
                                        "px-3 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors min-h-[40px] sm:min-h-[36px] flex items-center",
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
              disabled={logoutMutation.isPending}
              className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group w-full text-left text-xs sm:text-sm disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-gray-500 sm:w-5 sm:h-5 group-hover:text-red-500" />
              <span className="ml-2 sm:ml-3">
                {logoutMutation.isPending ? "Keluar..." : "Keluar"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
