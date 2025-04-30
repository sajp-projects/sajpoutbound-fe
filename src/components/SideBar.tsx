import { PERMISSION } from '@/const/PERMISSION';
import { useAuth } from '@/hooks/auth';
import { useRolePermissions } from '@/hooks/izin';
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
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '../lib/utils';

interface SubMenuItem {
  name: string;
  path: string;
  action?: string; // Optional action for permission check
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  resource?: string; // Resource name for permission check
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

  // Get roleId from localStorage
  const userData = localStorage.getItem('user');
  const roleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions only if authenticated and have roleId
  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== '',
  });

  const hasPermission = (resource: string, action: string): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/',
    },
    {
      name: 'Pengguna',
      icon: <Users className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.USER,
      subItems: [
        {
          name: 'Daftar Pengguna',
          path: '/pengguna',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Pengguna',
          path: '/pengguna/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Arsip Pengguna',
          path: '/pengguna/arsip',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Peran',
      icon: <ShieldCheck className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.ROLE,
      subItems: [
        {
          name: 'Daftar Peran',
          path: '/peran',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Peran',
          path: '/peran/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
      ],
    },
    {
      name: 'Barang',
      icon: <Package className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.BARANG,
      subItems: [
        {
          name: 'Daftar Barang',
          path: '/barang',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Barang',
          path: '/barang/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Log Barang',
          path: '/barang/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Kustomer',
      icon: <UserCheck className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.KUSTOMER,
      subItems: [
        {
          name: 'Daftar Kustomer',
          path: '/kustomer',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Kustomer',
          path: '/kustomer/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Log Kustomer',
          path: '/kustomer/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Gudang',
      icon: <Warehouse className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.GUDANG,
      subItems: [
        {
          name: 'Daftar Gudang',
          path: '/gudang',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Gudang',
          path: '/gudang/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Log Gudang',
          path: '/gudang/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Delivery Order',
      icon: <FileText className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.DO,
      subItems: [
        {
          name: 'Daftar DO',
          path: '/do',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah DO',
          path: '/do/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'DO Arsip',
          path: '/do/arsip',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Log DO',
          path: '/do/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Armada',
      icon: <Truck className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.ARMADA,
      subItems: [
        {
          name: 'Daftar Armada',
          path: '/armada',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Armada',
          path: '/armada/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Log Armada',
          path: '/armada/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Pengiriman',
      icon: <PackageCheck className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      subItems: [
        {
          name: 'Daftar Pengiriman',
          path: '/pengiriman',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Tambah Pengiriman',
          path: '/pengiriman/tambah',
          action: PERMISSION.ACTIONS.CREATE,
        },
        {
          name: 'Pengiriman Arsip',
          path: '/pengiriman/arsip',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Log Pengiriman',
          path: '/pengiriman/log',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
    {
      name: 'Laporan',
      icon: <BarChart3 className="w-5 h-5" />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      subItems: [
        {
          name: 'Laporan Gudang',
          path: '/laporan/gudang',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Laporan Pengiriman',
          path: '/laporan/pengiriman',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Laporan DO',
          path: '/laporan/do',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Laporan Armada',
          path: '/laporan/armada',
          action: PERMISSION.ACTIONS.READ,
        },
        {
          name: 'Laporan Custom',
          path: '/laporan/custom',
          action: PERMISSION.ACTIONS.READ,
        },
      ],
    },
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((item) => item !== menuName)
        : [...prev, menuName]
    );
  };

  const isMenuActive = (menuName: string) => {
    return menuItems
      .find((item) => item.name === menuName)
      ?.subItems?.some((subItem) => location.pathname === subItem.path);
  };

  const isSubMenuActive = (path: string) => {
    return location.pathname === path;
  };

  // Check if a menu item should be shown based on permissions
  const shouldShowMenuItem = (item: MenuItem): boolean => {
    // If no resource is specified, always show the item
    if (!item.resource) return true;

    // If it's a menu with subitems, check if any subitem is accessible
    if (item.subItems) {
      const hasAnyAccess = item.subItems.some((subItem) =>
        hasPermission(item.resource!, subItem.action || PERMISSION.ACTIONS.READ)
      );

      return hasAnyAccess;
    }

    // For single items, check the READ permission by default
    const hasAccess = hasPermission(item.resource, PERMISSION.ACTIONS.READ);

    return hasAccess;
  };

  // Check if a submenu item should be shown
  const shouldShowSubMenuItem = (
    item: MenuItem,
    subItem: SubMenuItem
  ): boolean => {
    if (!item.resource) return true;

    const hasAccess = hasPermission(
      item.resource,
      subItem.action || PERMISSION.ACTIONS.READ
    );

    return hasAccess;
  };

  function handleLogout() {
    logout();
  }

  // If loading permissions, show loading state
  if (isLoading) {
    return (
      <aside
        className={cn(
          'h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-300 shadow-sm',
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'
        )}
      >
        <div className="h-full flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mt-2 text-sm text-gray-500">Loading...</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'h-screen fixed top-0 left-0 bg-white border-r border-gray-200 z-20 transition-transform duration-300 shadow-sm',
        isOpen
          ? 'w-64 translate-x-0'
          : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'
      )}
    >
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
          <div className="mt-1 text-xs text-gray-500 font-medium">
            Sistem Manajemen DO
          </div>
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
            {menuItems.map(
              (item) =>
                shouldShowMenuItem(item) && (
                  <li key={item.name}>
                    {item.path ? (
                      <Link
                        to={item.path}
                        className={cn(
                          'flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors',
                          location.pathname === item.path &&
                            'bg-blue-50 text-blue-600 font-medium'
                        )}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={cn(
                            'flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors',
                            (openMenus.includes(item.name) ||
                              isMenuActive(item.name)) &&
                              'bg-blue-50 text-blue-600 font-medium'
                          )}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 transition-transform',
                              openMenus.includes(item.name) &&
                                'transform rotate-180'
                            )}
                          />
                        </button>
                        {item.subItems && (
                          <ul
                            className={cn(
                              'mt-1 ml-8 space-y-1 overflow-hidden transition-all max-h-0',
                              openMenus.includes(item.name) && 'max-h-96'
                            )}
                          >
                            {item.subItems.map(
                              (subItem) =>
                                shouldShowSubMenuItem(item, subItem) && (
                                  <li key={subItem.name}>
                                    <Link
                                      to={subItem.path}
                                      className={cn(
                                        'block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors',
                                        isSubMenuActive(subItem.path) &&
                                          'bg-blue-50 text-blue-600 font-medium'
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

        {/* User Actions Section with Divider */}
        <div className="mt-auto">
          <div className="px-4 py-3 text-xs text-gray-500 font-medium uppercase flex items-center">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-2">User</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <div className="px-3 pb-5 pt-1">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors group w-full text-left"
            >
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
