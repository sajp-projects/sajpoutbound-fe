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
const ArsipPengguna = lazy(() => import("./pages/user/archiveUser"));
const Pengguna = lazy(() => import("./pages/user/listUser"));
const DetailPengguna = lazy(() => import("./pages/user/detailUser"));
const EditPengguna = lazy(() => import("./pages/user/editUser"));
const LogPengguna = lazy(() => import("./pages/user/logUser"));
const TambahPengguna = lazy(() => import("./pages/user/addUser"));
const LogSemuaPengguna = lazy(() => import("./pages/user/logAllUser"));

// Lazy import untuk halaman peran
const Role = lazy(() => import("./pages/role/listRole"));
const DetailPeran = lazy(() => import("./pages/role/detailRole"));
const EditPeran = lazy(() => import("./pages/role/editRole"));
const TambahPeran = lazy(() => import("./pages/role/addRole"));

// Lazy import untuk halaman izin
const DaftarIzin = lazy(() => import("./pages/permission/permissionList"));
const IzinPeran = lazy(() => import("./pages/role/permissionOfRole"));

// Lazy import untuk halaman gudang
const DaftarGudang = lazy(() => import("./pages/warehouse/listWarehouse"));
const DetailGudang = lazy(() => import("./pages/warehouse/detailWarehouse"));
const EditGudang = lazy(() => import("./pages/warehouse/editWarehouse"));
const TambahGudang = lazy(() => import("./pages/warehouse/addWarehouse"));
const LogGudang = lazy(() => import("./pages/warehouse/logWarehouse"));
const LogSemuaGudang = lazy(() => import("./pages/warehouse/logAllWarehouse"));

// Lazy import untuk halaman barang
const DaftarBarang = lazy(() => import("./pages/product/listProduct"));
const DetailBarang = lazy(() => import("./pages/product/detailProduct"));
const EditBarang = lazy(() => import("./pages/product/editProduct"));
const TambahBarang = lazy(() => import("./pages/product/addProduct"));
const LogBarang = lazy(() => import("./pages/product/logProduct"));
const LogSemuaBarang = lazy(() => import("./pages/product/logAllProduct"));

// Lazy import untuk halaman pelanggan
const DaftarPelanggan = lazy(() => import("./pages/customer/listCustomer"));
const TambahPelanggan = lazy(() => import("./pages/customer/addCustomer"));
const LogPelanggan = lazy(() => import("./pages/customer/logCustomer"));
const LogSemuaPelanggan = lazy(() => import("./pages/customer/logAllCustomer"));
const EditPelanggan = lazy(() => import("./pages/customer/editCustomer"));
const DetailPelanggan = lazy(() => import("./pages/customer/detailCustomer"));

// Lazy import untuk halaman armada
const DaftarArmada = lazy(() => import("./pages/armada/listArmada"));
const TambahArmada = lazy(() => import("./pages/armada/addArmada"));
const LogArmada = lazy(() => import("./pages/armada/logArmada"));
const LogSemuaArmada = lazy(() => import("./pages/armada/logAllArmada"));
const EditArmada = lazy(() => import("./pages/armada/editArmada"));
const DetailArmada = lazy(() => import("./pages/armada/detailArmada"));

// Lazy import untuk halaman DO
const DaftarDo = lazy(() => import("./pages/do/listDo"));
const TambahDo = lazy(() => import("./pages/do/addDo"));
const LogDo = lazy(() => import("./pages/do/logDo"));
const ArsipDo = lazy(() => import("./pages/do/archiveDo"));
const EditDo = lazy(() => import("./pages/do/editDo"));
const DetailDo = lazy(() => import("./pages/do/detailDo"));
const LogSemuaDo = lazy(() => import("./pages/do/logAllDo"));

const LaporanOperasional = lazy(() => import("./pages/report/operational"));
const LaporanPenugasanPengiriman = lazy(
  () => import("./pages/report/deliveryAssignment")
);

const LaporanPengeluaran = lazy(() => import("./pages/report/expenditure"));
const DaftarPengiriman = lazy(() => import("./pages/shipment/listShipment"));
const LogPengiriman = lazy(() => import("./pages/shipment/logShipment"));
const DetailPengiriman = lazy(() => import("./pages/shipment/detailShipment"));
const EditPengiriman = lazy(() => import("./pages/shipment/editShipment"));
const TambahPengiriman = lazy(() => import("./pages/shipment/addShipment"));
const LogSemuaPengiriman = lazy(
  () => import("./pages/shipment/logAllShipment")
);
const ArsipPengiriman = lazy(() => import("./pages/shipment/archiveShipment"));

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
      action: PERMISSION.ACTIONS.UPDATE,
      redirectTo: "/peran",
    },
  ];

  const izinRoutes: ProtectedRouteConfig[] = [
    {
      path: "",
      element: <DaftarIzin />,
      resource: PERMISSION.RESOURCES.PERMISSION,
      action: PERMISSION.ACTIONS.READ,
      redirectTo: "/",
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
      path: "pengeluaran",
      element: <LaporanPengeluaran />,
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

            {/* Route untuk izin */}
            <Route path="/izin">
              {izinRoutes.map((route) => createProtectedRoute(route))}
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
