import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import Footer from "../components/Footer";

export default function BaseLayout() {
  return (
    <div>
      <Navbar />
      <SideBar />
      <Outlet />
      <Footer />
    </div>
  );
}
