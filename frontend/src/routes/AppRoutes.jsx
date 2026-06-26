import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";

const MovieDetailPage = lazy(
  () => import("../pages/MovieDetailPage/MovieDetailPage")
);
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage/RegisterPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage/ProfilePage"));
const CineMeetPage = lazy(() => import("../pages/CineMeetPage/CineMeetPage"));
const BookingPage = lazy(() => import("../pages/BookingPage/BookingPage"));

const AdminCinemaPage = lazy(
  () => import("../pages/AdminCinemaPage/AdminCinemaPage")
);
const AdminLayout = lazy(() => import("../components/layout/AdminLayout"));
const VoucherManagementPage = lazy(
  () => import("../pages/Admin/VoucherManagement/VoucherManagementPage")
);
const MovieManagementPage = lazy(
  () => import("../pages/Admin/MovieManagement/MovieManagementPage")
);
const RoomManagementPage = lazy(
  () => import("../pages/Admin/RoomManagement/RoomManagementPage")
);
const ShowtimeManagementPage = lazy(
  () => import("../pages/Admin/ShowtimeManagement/ShowtimeManagementPage")
);
const UserManagementPage = lazy(
  () => import("../pages/Admin/CustomerManagement/CustomerManagementPage")
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
        <Route path="/cinemeet" element={<CineMeetPage />} />
        <Route path="/booking/:movieId" element={<BookingPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<VoucherManagementPage />} />
          <Route path="vouchers" element={<VoucherManagementPage />} />
          <Route path="movies" element={<MovieManagementPage />} />
          <Route path="cinemas" element={<AdminCinemaPage />} />
          <Route path="rooms" element={<RoomManagementPage />} />
          <Route path="showtimes" element={<ShowtimeManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
