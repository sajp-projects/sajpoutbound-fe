import { BrowserRouter, Route, Routes } from "react-router";
import { PERMISSION } from "./constant/PERMISSION";
import AuthLayout from "./layout/AuthLayout";
import BaseLayout from "./layout/BaseLayout";
import { default as ActionLayout, default as RBACLayout } from "./layout/RBACLayout";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={<BaseLayout />}>
          {/* Dashboard - requires basic authentication */}
          <Route index element={<Dashboard />} />

          {/* User routes */}
          <Route path="/pengguna">
            <Route
              index
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.READ} redirectTo="/">
                  <Pengguna />
                </RBACLayout>
              }
            />
            <Route
              path="tambah"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.CREATE} redirectTo="/pengguna">
                  <TambahPengguna />
                </RBACLayout>
              }
            />
            <Route
              path="arsip"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.READ} redirectTo="/pengguna">
                  <ArsipPengguna />
                </RBACLayout>
              }
            />
            <Route
              path=":id/log"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.READ} redirectTo="/pengguna">
                  <LogPengguna />
                </RBACLayout>
              }
            />
            <Route
              path=":id/edit"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.UPDATE} redirectTo="/pengguna">
                  <EditPengguna />
                </RBACLayout>
              }
            />
            <Route
              path=":id"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.USER} action={PERMISSION.ACTIONS.READ} redirectTo="/pengguna">
                  <DetailPengguna />
                </RBACLayout>
              }
            />
          </Route>
          {/* Role routes */}
          <Route path="/peran">
            <Route
              index
              element={
                <ActionLayout resource={PERMISSION.RESOURCES.ROLE} action={PERMISSION.ACTIONS.READ} redirectTo="/">
                  <Role />
                </ActionLayout>
              }
            />
            <Route
              path="tambah"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.ROLE} action={PERMISSION.ACTIONS.CREATE} redirectTo="/peran">
                  <TambahPeran />
                </RBACLayout>
              }
            />
            <Route
              path=":id"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.ROLE} action={PERMISSION.ACTIONS.READ} redirectTo="/peran">
                  <DetailPeran />
                </RBACLayout>
              }
            />
            <Route
              path=":id/edit"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.ROLE} action={PERMISSION.ACTIONS.UPDATE} redirectTo="/peran">
                  <EditPeran />
                </RBACLayout>
              }
            />
            <Route
              path=":id/izin"
              element={
                <RBACLayout resource={PERMISSION.RESOURCES.PERMISSION} action={PERMISSION.ACTIONS.READ} redirectTo="/peran">
                  <IzinPeran />
                </RBACLayout>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
