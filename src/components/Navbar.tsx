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
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Right Side */}
          <div className="relative">
            <button type="button" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-100 text-sm" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white">
                <UserIcon className="h-5 w-5" />
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
                  <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  Profil Saya
                </Link>
                <Link to="/settings" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                  <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  Pengaturan Akun
                </Link>
                <div className="border-t border-gray-100"></div>
                <button onClick={logout} className="group flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                  <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
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
