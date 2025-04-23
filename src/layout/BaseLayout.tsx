import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";

export default function BaseLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, isLoading, checkAuthRedirect } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      if (isSmallScreen) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Cek apakah sudah login, jika belum redirect ke halaman login
  useEffect(() => {
    checkAuthRedirect(true, "/login");
  }, [checkAuthRedirect]);

  // Jika masih loading atau belum login, jangan tampilkan apapun
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Full Height */}
      <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : ""}`}>
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="flex-grow p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
