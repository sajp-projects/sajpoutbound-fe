import { BrowserRouter, Route, Routes } from "react-router";
import { PERMISSION } from "@/constant/PERMISSION";
import AuthLayout from "./layout/AuthLayout";
import BaseLayout from "./layout/BaseLayout";
import RBACLayout from "./layout/RBACLayout";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import ArsipPengguna from "./pages/pengguna/arsipPengguna";
import Pengguna from "./pages/pengguna/daftarPengguna";
import DetailPengguna from "./pages/pengguna/detailPengguna";
import EditPengguna from "./pages/pengguna/editPengguna";
import LogPengguna from "./pages/pengguna/logPengguna";
import TambahPengguna from "./pages/pengguna/tambahPengguna";
import Role from "./pages/peran/daftarPeran";
import DetailPeran from "./pages/peran/detailPeran";
import EditPeran from "./pages/peran/editPeran";
import IzinPeran from "./pages/izin/daftarIzin";
import TambahPeran from "./pages/peran/tambahPeran";
import DaftarGudang from "./pages/gudang/daftarGudang";
import DetailGudang from "./pages/gudang/detailGudang";
import EditGudang from "./pages/gudang/editGudang";
import TambahGudang from "./pages/gudang/tambahGudang";
import LogGudang from "./pages/gudang/logGudang";
import LogSemuaGudang from "./pages/gudang/logSemuaGudang";
import LogSemuaPengguna from "./pages/pengguna/logSemuaPengguna";
import DaftarBarang from "./pages/barang/daftarBarang";
import DetailBarang from "./pages/barang/detailBarang";
import EditBarang from "./pages/barang/editBarang";
import TambahBarang from "./pages/barang/tambahBarang";
import LogBarang from "./pages/barang/logBarang";
import LogSemuaBarang from "./pages/barang/logSemuaBarang";

// Type untuk resource route yang dilindungi
interface ProtectedRouteConfig {
  path: string;
  element: React.ReactNode;
  resource: string;
  action: string;
  redirectTo?: string;
}

export default function App() {
  // Helper untuk membuat protected route dengan RBAC
  const createProtectedRoute = ({ path, element, resource, action, redirectTo }: ProtectedRouteConfig) => (
    <Route
      path={path}
      element={
        <RBACLayout resource={resource} action={action} redirectTo={redirectTo}>
          {element}
        </RBACLayout>
      }
    />
  );

  // Konfigurasi rute pengguna
  const userRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <Pengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/",
    },
    {
      path: "tambah",
      element: <TambahPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/pengguna",
    },
    {
      path: "arsip",
      element: <ArsipPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengguna",
    },
    {
      path: ":id/log",
      element: <LogPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengguna",
    },
    {
      path: "log",
      element: <LogSemuaPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengguna",
    },
    {
      path: ":id/edit",
      element: <EditPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/pengguna",
    },
    {
      path: ":id",
      element: <DetailPengguna />,
      resource: PERMISSION.RESOURCES.USER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengguna",
    },
  ];

  // Konfigurasi rute peran
  const roleRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <Role />,
      resource: PERMISSION.RESOURCES.ROLE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/",
    },
    {
      path: "tambah",
      element: <TambahPeran />,
      resource: PERMISSION.RESOURCES.ROLE,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/peran",
    },
    {
      path: ":id",
      element: <DetailPeran />,
      resource: PERMISSION.RESOURCES.ROLE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/peran",
    },
    {
      path: ":id/edit",
      element: <EditPeran />,
      resource: PERMISSION.RESOURCES.ROLE,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/peran",
    },
    {
      path: ":id/izin",
      element: <IzinPeran />,
      resource: PERMISSION.RESOURCES.PERMISSION,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/peran",
    },
  ];

  // Konfigurasi rute gudang
  const gudangRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/",
    },
    {
      path: "tambah",
      element: <TambahGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/gudang",
    },
    {
      path: ":id/log",
      element: <LogGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/gudang",
    },
    {
      path: "log",
      element: <LogSemuaGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/gudang",
    },
    {
      path: ":id/edit",
      element: <EditGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/gudang",
    },
    {
      path: ":id",
      element: <DetailGudang />,
      resource: PERMISSION.RESOURCES.WAREHOUSE,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/gudang",
    },
  ];

  // Konfigurasi rute barang
  const barangRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/",
    },
    {
      path: "tambah",
      element: <TambahBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/barang",
    },
    {
      path: ":id/log",
      element: <LogBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/barang",
    },
    {
      path: "log",
      element: <LogSemuaBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/barang",
    },
    {
      path: ":id/edit",
      element: <EditBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/barang",
    },
    {
      path: ":id",
      element: <DetailBarang />,
      resource: PERMISSION.RESOURCES.PRODUCT,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/barang",
    },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<BaseLayout />}>
          {/* Dashboard - membutuhkan autentikasi dasar */}
          <Route index element={<Dashboard />} />

          {/* Rute Pengguna */}
          <Route path="/pengguna">{userRoutes.map((route) => createProtectedRoute(route))}</Route>

          {/* Rute Peran */}
          <Route path="/peran">{roleRoutes.map((route) => createProtectedRoute(route))}</Route>

          {/* Rute Gudang */}
          <Route path="/gudang">{gudangRoutes.map((route) => createProtectedRoute(route))}</Route>

          {/* Rute Barang */}
          <Route path="/barang">{barangRoutes.map((route) => createProtectedRoute(route))}</Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
