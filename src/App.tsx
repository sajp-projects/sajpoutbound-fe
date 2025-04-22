import { BrowserRouter, Route, Routes } from "react-router";
import BaseLayout from "./layout/BaseLayout";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import AuthLayout from "./layout/AuthLayout";
import Role from "./pages/role";
import Pengguna from "./pages/pengguna/daftarPengguna";
import TambahPengguna from "./pages/pengguna/tambahPengguna";
import DetailPengguna from "./pages/pengguna/detailPengguna";
import EditPengguna from "./pages/pengguna/editPengguna";
import ArsipPengguna from "./pages/pengguna/arsipPengguna";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute autentikasi */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rute utama yang dilindungi oleh autentikasi */}
        <Route element={<BaseLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role" element={<Role />} />
          <Route path="/pengguna" element={<Pengguna />} />
          <Route path="/pengguna/tambah" element={<TambahPengguna />} />
          <Route path="/pengguna/arsip" element={<ArsipPengguna />} />
          <Route path="/pengguna/:id/edit" element={<EditPengguna />} />
          <Route path="/pengguna/:id" element={<DetailPengguna />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
