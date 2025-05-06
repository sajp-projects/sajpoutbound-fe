import { useState } from "react";
import { Link } from "react-router";
import { Menu, User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "@/hooks/auth";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {}
          <div className="relative">
            <button type="button" className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-lg hover:bg-gray-100 text-xs sm:text-sm" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="font-medium text-gray-900 text-xs sm:text-sm">{user?.name || "Pengguna"}</span>
                <span className="text-xs text-gray-500 max-w-[150px] truncate">{user?.email || "email@contoh.com"}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", isProfileOpen && "transform rotate-180")} />
            </button>

            {}
            {isProfileOpen && (
              <div className="absolute right-0 mt-1 sm:mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <p className="text-xs sm:text-sm">Selamat datang,</p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.email || "email@contoh.com"}</p>
                </div>
                <Link to="/profile" className="group flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <UserIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500" />
                  Profil Saya
                </Link>
                <Link to="/settings" className="group flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Settings className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500" />
                  Pengaturan Akun
                </Link>
                <div className="border-t border-gray-100"></div>
                <button onClick={logout} className="group flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 w-full text-left">
                  <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-red-400 group-hover:text-red-500" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
