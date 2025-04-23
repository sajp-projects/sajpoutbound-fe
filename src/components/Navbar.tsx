import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "@/hooks/auth";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Fungsi untuk mendapatkan judul halaman berdasarkan path
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/" || path === "/dashboard") return "Dashboard";

    // Cek path dasar tanpa parameter tambahan
    const basePath = path.split("/")[1];

    switch (basePath) {
      case "pengguna":
        return "Pengguna";
      case "peran":
        return "Peran";
      case "izin":
        return "Izin";
      case "barang":
        return "Barang";
      case "kustomer":
        return "Kustomer";
      case "gudang":
        return "Gudang";
      case "do":
        return "Delivery Order";
      case "armada":
        return "Armada";
      case "pengiriman":
        return "Pengiriman";
      case "laporan":
        return "Laporan";
      case "login":
        return "Login";
      default:
        return "Dashboard";
    }
  };

  // Event listener untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pageTitle = getPageTitle();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side - Toggle Button & Page Title */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page Title - showing current active page */}
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-800">{pageTitle}</h1>
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center">
            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-medium text-gray-900">{user?.name || "Pengguna"}</span>
                  <span className="text-xs text-gray-500">{user?.email || "email@contoh.com"}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", isProfileOpen && "transform rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm">Selamat datang,</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email || "email@contoh.com"}</p>
                  </div>
                  <Link to="/profile" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    Profil Saya
                  </Link>
                  <Link to="/settings" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                    Pengaturan Akun
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button onClick={handleLogout} className="group flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
