import LoadingFallback from "@/components/LoadingFallback";
import { PERMISSION } from "@/constant/PERMISSION";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthLayout from "./layout/AuthLayout";
import BaseLayout from "./layout/BaseLayout";
import RBACLayout from "./layout/RBACLayout";

// Lazy import untuk semua komponen halaman
const Login = lazy(() => import("./pages/auth/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const NotFound = lazy(() => import("./pages/notFound"));

// Lazy import untuk halaman pengguna
const ArsipPengguna = lazy(() => import("./pages/pengguna/arsipPengguna"));
const Pengguna = lazy(() => import("./pages/pengguna/daftarPengguna"));
const DetailPengguna = lazy(() => import("./pages/pengguna/detailPengguna"));
const EditPengguna = lazy(() => import("./pages/pengguna/editPengguna"));
const LogPengguna = lazy(() => import("./pages/pengguna/logPengguna"));
const TambahPengguna = lazy(() => import("./pages/pengguna/tambahPengguna"));
const LogSemuaPengguna = lazy(
  () => import("./pages/pengguna/logSemuaPengguna")
);

// Lazy import untuk halaman peran
const Role = lazy(() => import("./pages/peran/daftarPeran"));
const DetailPeran = lazy(() => import("./pages/peran/detailPeran"));
const EditPeran = lazy(() => import("./pages/peran/editPeran"));
const IzinPeran = lazy(() => import("./pages/izin/daftarIzin"));
const TambahPeran = lazy(() => import("./pages/peran/tambahPeran"));

// Lazy import untuk halaman gudang
const DaftarGudang = lazy(() => import("./pages/gudang/daftarGudang"));
const DetailGudang = lazy(() => import("./pages/gudang/detailGudang"));
const EditGudang = lazy(() => import("./pages/gudang/editGudang"));
const TambahGudang = lazy(() => import("./pages/gudang/tambahGudang"));
const LogGudang = lazy(() => import("./pages/gudang/logGudang"));
const LogSemuaGudang = lazy(() => import("./pages/gudang/logSemuaGudang"));

// Lazy import untuk halaman barang
const DaftarBarang = lazy(() => import("./pages/barang/daftarBarang"));
const DetailBarang = lazy(() => import("./pages/barang/detailBarang"));
const EditBarang = lazy(() => import("./pages/barang/editBarang"));
const TambahBarang = lazy(() => import("./pages/barang/tambahBarang"));
const LogBarang = lazy(() => import("./pages/barang/logBarang"));
const LogSemuaBarang = lazy(() => import("./pages/barang/logSemuaBarang"));

// Lazy import untuk halaman pelanggan
const DaftarPelanggan = lazy(() => import("./pages/pelanggan/daftarPelanggan"));
const TambahPelanggan = lazy(() => import("./pages/pelanggan/tambahPelanggan"));
const LogPelanggan = lazy(() => import("./pages/pelanggan/logPelanggan"));
const LogSemuaPelanggan = lazy(
  () => import("./pages/pelanggan/logSemuaPelanggan")
);
const EditPelanggan = lazy(() => import("./pages/pelanggan/editPelanggan"));
const DetailPelanggan = lazy(() => import("./pages/pelanggan/detailPelanggan"));

// Lazy import untuk halaman armada
const DaftarArmada = lazy(() => import("./pages/armada/daftarArmada"));
const TambahArmada = lazy(() => import("./pages/armada/tambahArmada"));
const LogArmada = lazy(() => import("./pages/armada/logArmada"));
const LogSemuaArmada = lazy(() => import("./pages/armada/logSemuaArmada"));
const EditArmada = lazy(() => import("./pages/armada/editArmada"));
const DetailArmada = lazy(() => import("./pages/armada/detailArmada"));

// Lazy import untuk halaman DO
const DaftarDo = lazy(() => import("./pages/do/daftarDo"));
const TambahDo = lazy(() => import("./pages/do/tambahDo"));
const LogDo = lazy(() => import("./pages/do/logDo"));
const ArsipDo = lazy(() => import("./pages/do/arsipDo"));
const EditDo = lazy(() => import("./pages/do/editDo"));
const DetailDo = lazy(() => import("./pages/do/detailDo"));
const LogSemuaDo = lazy(() => import("./pages/do/logSemuaDo"));

const LaporanOperasional = lazy(() => import("./pages/laporan/operasional"));
const LaporanPenugasanPengiriman = lazy(
  () => import("./pages/laporan/penugasanPengiriman")
);

const LaporanPengeluaranHarian = lazy(
  () => import("./pages/laporan/pengeluaranHarian")
);
const LaporanPengeluaranBulanan = lazy(
  () => import("./pages/laporan/pengeluaranBulanan")
);

// Lazy import untuk halaman pengiriman
const DaftarPengiriman = lazy(
  () => import("./pages/pengiriman/daftarPengiriman")
);
const LogPengiriman = lazy(() => import("./pages/pengiriman/logPengiriman"));
const DetailPengiriman = lazy(
  () => import("./pages/pengiriman/detailPengiriman")
);
const EditPengiriman = lazy(() => import("./pages/pengiriman/editPengiriman"));
const TambahPengiriman = lazy(
  () => import("./pages/pengiriman/tambahPengiriman")
);
const LogSemuaPengiriman = lazy(
  () => import("./pages/pengiriman/logSemuaPengiriman")
);
const ArsipPengiriman = lazy(
  () => import("./pages/pengiriman/arsipPengiriman")
);

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

  const laporanRoutes: ProtectedRouteConfig[] = [
    {
      path: "operasional",
      element: <LaporanOperasional />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/laporan",
    },
    {
      path: "pengeluaranHarian",
      element: <LaporanPengeluaranHarian />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/laporan",
    },
    {
      path: "pengeluaranBulanan",
      element: <LaporanPengeluaranBulanan />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/laporan",
    },
    {
      path: "penugasan",
      element: <LaporanPenugasanPengiriman />,
      resource: PERMISSION.RESOURCES.LAPORAN,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/laporan",
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Route untuk autentikasi */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Route untuk halaman utama */}
          <Route element={<BaseLayout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Route untuk pengguna */}
            <Route path="/pengguna">
              {userRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk peran */}
            <Route path="/peran">
              {roleRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk gudang */}
            <Route path="/gudang">
              {gudangRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk barang */}
            <Route path="/barang">
              {barangRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk pelanggan */}
            <Route path="/pelanggan">
              {pelangganRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk armada */}
            <Route path="/armada">
              {armadaRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk DO */}
            <Route path="/do">
              {doRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk laporan */}
            <Route path="/laporan">
              {laporanRoutes.map((route) => createProtectedRoute(route))}
            </Route>

            {/* Route untuk pengiriman */}
            <Route path="/pengiriman">
              {shipmentRoutes.map((route) => createProtectedRoute(route))}
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
