import { BrowserRouter, Route, Routes } from "react-router";
import BaseLayout from "./layout/BaseLayout";
import Login from "./pages/auth/login";
import Dashboard from "./pages/dashboard";
import AuthLayout from "./layout/AuthLayout";
import Role from "./pages/role";
import Pengguna from "./pages/pengguna";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/role" element={<Role />} />
          <Route path="/pengguna" element={<Pengguna />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
