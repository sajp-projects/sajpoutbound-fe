import { useAuth } from "@/hooks/auth";
import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";

export default function BaseLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isLoading, checkAuthRedirect } = useAuth();
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      if (isSmallScreen) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && isSidebarOpen && mainContentRef.current) {
        if (mainContentRef.current.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    checkAuthRedirect(true, "/login");
  }, [checkAuthRedirect]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {}
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {}
      <div
        ref={mainContentRef}
        className={`flex flex-col flex-1 w-full transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="flex-grow px-2 py-3 sm:px-4 sm:py-4 md:py-6">
          <div className="w-full mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
