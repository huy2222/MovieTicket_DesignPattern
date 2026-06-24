import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";

const MovieDetailPage = lazy(
  () => import("../pages/MovieDetailPage/MovieDetailPage")
);
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage/RegisterPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage/ProfilePage"));
const AdminCinemaPage = lazy(
  () => import("../pages/AdminCinemaPage/AdminCinemaPage")
);
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const VoucherManagementPage = lazy(
  () => import("../pages/Admin/VoucherManagementPage")
);
const MovieManagementPage = lazy(
  () => import("../pages/Admin/MovieManagementPage")
);
const RoomManagementPage = lazy(
  () => import("../pages/Admin/RoomManagementPage")
);
const ShowtimeManagementPage = lazy(
  () => import("../pages/Admin/ShowtimeManagementPage")
);

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-spinner" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<ProfilePage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<VoucherManagementPage />} />
          <Route path="vouchers" element={<VoucherManagementPage />} />
          <Route path="movies" element={<MovieManagementPage />} />
          <Route path="cinemas" element={<AdminCinemaPage />} />
          <Route path="rooms" element={<RoomManagementPage />} />
          <Route path="showtimes" element={<ShowtimeManagementPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
