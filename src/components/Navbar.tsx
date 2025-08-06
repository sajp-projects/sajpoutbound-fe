import { useAuth } from "@/hooks/auth";
import { ChevronDown, LogOut, Menu, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, logoutMutation } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 sm:p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-lg hover:bg-gray-100 text-xs sm:text-sm"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="flex items-center justify-center text-white rounded-full h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-500 to-blue-700">
                <UserIcon className="w-4 h-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-col items-start hidden md:flex">
                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                  {user?.name || "Pengguna"}
                </span>
                <span className="text-xs text-gray-500 max-w-[150px] truncate">
                  {user?.email || "email@contoh.com"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  isProfileOpen && "transform rotate-180"
                )}
              />
            </button>

            {}
            {isProfileOpen && (
              <div className="absolute right-0 z-20 w-48 py-1 mt-1 origin-top-right bg-white rounded-md shadow-lg sm:mt-2 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-3 py-2 border-b border-gray-100 sm:px-4 sm:py-3">
                  <p className="text-xs sm:text-sm">Selamat datang,</p>
                  <p className="text-xs font-medium text-gray-900 truncate sm:text-sm">
                    {user?.email || "email@contoh.com"}
                  </p>
                </div>

                <div className="border-t border-gray-100"></div>
                <button
                  onClick={logout}
                  disabled={logoutMutation.isPending}
                  className="group flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 w-full text-left disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 mr-2 text-red-400 sm:mr-3 sm:h-5 sm:w-5 group-hover:text-red-500" />
                  {logoutMutation.isPending ? "Keluar..." : "Keluar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
