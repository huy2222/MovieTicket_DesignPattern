import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
import ProtectedRoute from "./ProtectedRoute";

const MovieDetailPage = lazy(
  () => import("../pages/MovieDetailPage/MovieDetailPage")
);
const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage/RegisterPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage/ProfilePage"));
const CineMeetPage = lazy(() => import("../pages/CineMeetPage/CineMeetPage"));
const BookingPage = lazy(() => import("../pages/BookingPage/BookingPage"));
const PaymentResultPage = lazy(() => import("../pages/PaymentResultPage/PaymentResultPage"));

const DashboardPage = lazy(
  () => import("../pages/Admin/Dashboard/DashboardPage")
);
const EmployeeManagementPage = lazy(
  () => import("../pages/Admin/EmployeeManagement/EmployeeManagementPage")
);
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
        <Route path="/booking/:movieId" element={<BookingPage />} />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route
          path="/cinemeet"
          element={
            <ProtectedRoute>
              <CineMeetPage />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<EmployeeManagementPage />} />
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
