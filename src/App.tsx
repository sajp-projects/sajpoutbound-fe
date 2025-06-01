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
import DaftarPelanggan from "./pages/pelanggan/daftarPelanggan";
import TambahPelanggan from "./pages/pelanggan/tambahPelanggan";
import LogPelanggan from "./pages/pelanggan/logPelanggan";
import LogSemuaPelanggan from "./pages/pelanggan/logSemuaPelanggan";
import EditPelanggan from "./pages/pelanggan/editPelanggan";
import DetailPelanggan from "./pages/pelanggan/detailPelanggan";
import DaftarArmada from "./pages/armada/daftarArmada";
import TambahArmada from "./pages/armada/tambahArmada";
import LogArmada from "./pages/armada/logArmada";
import LogSemuaArmada from "./pages/armada/logSemuaArmada";
import EditArmada from "./pages/armada/editArmada";
import DetailArmada from "./pages/armada/detailArmada";
import NotFound from "./pages/notFound";
import DaftarDo from "./pages/do/daftarDo";
import TambahDo from "./pages/do/tambahDo";
import LogDo from "./pages/do/logDo";
import ArsipDo from "./pages/do/arsipDo";
import EditDo from "./pages/do/editDo";
import DetailDo from "./pages/do/detailDo";
import LogSemuaDo from "./pages/do/logSemuaDo";
import DaftarPengiriman from "./pages/pengiriman/daftarPengiriman";
import LogPengiriman from "./pages/pengiriman/logPengiriman";
import DetailPengiriman from "./pages/pengiriman/detailPengiriman";
import EditPengiriman from "./pages/pengiriman/editPengiriman";
import TambahPengiriman from "./pages/pengiriman/tambahPengiriman";
import LogSemuaPengiriman from "./pages/pengiriman/logSemuaPengiriman";
import ArsipPengiriman from "./pages/pengiriman/arsipPengiriman";

interface ProtectedRouteConfig {
  path: string;
  element: React.ReactNode;
  resource: string;
  action: string;
  redirectTo?: string;
}

export default function App() {
  const createProtectedRoute = ({
    path,
    element,
    resource,
    action,
    redirectTo,
  }: ProtectedRouteConfig) => (
    <Route
      path={path}
      element={
        <RBACLayout resource={resource} action={action} redirectTo={redirectTo}>
          {element}
        </RBACLayout>
      }
    />
  );

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

  const pelangganRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pelanggan",
    },
    {
      path: "tambah",
      element: <TambahPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/pelanggan",
    },
    {
      path: ":id/log",
      element: <LogPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pelanggan",
    },
    {
      path: "log",
      element: <LogSemuaPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.READ,
    },
    {
      path: ":id/edit",
      element: <EditPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/pelanggan",
    },
    {
      path: ":id",
      element: <DetailPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pelanggan",
    },
    {
      path: "log",
      element: <LogSemuaPelanggan />,
      resource: PERMISSION.RESOURCES.CUSTOMER,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pelanggan",
    },
  ];

  const armadaRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/armada",
    },
    {
      path: "tambah",
      element: <TambahArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/armada",
    },
    {
      path: ":id/log",
      element: <LogArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/armada",
    },
    {
      path: "log",
      element: <LogSemuaArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/armada",
    },
    {
      path: ":id/edit",
      element: <EditArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/armada",
    },
    {
      path: ":id",
      element: <DetailArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/armada",
    },
    {
      path: "log",
      element: <LogSemuaArmada />,
      resource: PERMISSION.RESOURCES.ARMADA,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/armada",
    },
  ];

  const doRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/do",
    },
    {
      path: "tambah",
      element: <TambahDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/do",
    },
    {
      path: ":id/log",
      element: <LogDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/do",
    },
    {
      path: "arsip",
      element: <ArsipDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/do",
    },
    {
      path: ":id/edit",
      element: <EditDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/do",
    },
    {
      path: ":id",
      element: <DetailDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/do",
    },
    {
      path: "log",
      element: <LogSemuaDo />,
      resource: PERMISSION.RESOURCES.DO,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/do",
    },
  ];

  const shipmentRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengiriman",
    },
    {
      path: "tambah",
      element: <TambahPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.CREATE,
      redirectTo: "/pengiriman",
    },
    {
      path: ":id/log",
      element: <LogPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengiriman",
    },
    {
      path: "arsip",
      element: <ArsipPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengiriman",
    },
    {
      path: ":id/edit",
      element: <EditPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/pengiriman",
    },
    {
      path: ":id",
      element: <DetailPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengiriman",
    },
    {
      path: "log",
      element: <LogSemuaPengiriman />,
      resource: PERMISSION.RESOURCES.PENGIRIMAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/pengiriman",
    },
  ];
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {}
        <Route element={<BaseLayout />}>
          {}
          <Route index element={<Dashboard />} />

          {}
          <Route path="/pengguna">
            {userRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/peran">
            {roleRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/gudang">
            {gudangRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/barang">
            {barangRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/pelanggan">
            {pelangganRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/armada">
            {armadaRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/do">
            {doRoutes.map((route) => createProtectedRoute(route))}
          </Route>

          {}
          <Route path="/pengiriman">
            {shipmentRoutes.map((route) => createProtectedRoute(route))}
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
