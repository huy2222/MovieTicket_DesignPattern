import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
import MovieDetailPage from "../pages/MovieDetailPage/MovieDetailPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import AdminCinemaPage from "../pages/AdminCinemaPage/AdminCinemaPage";

// Admin
import AdminLayout from "../components/layout/AdminLayout";
import VoucherManagementPage from "../pages/Admin/VoucherManagementPage";
import MovieManagementPage from "../pages/Admin/MovieManagementPage";
import RoomManagementPage from "../pages/Admin/RoomManagementPage";
import ShowtimeManagementPage from "../pages/Admin/ShowtimeManagementPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<VoucherManagementPage />} />
                <Route path="vouchers" element={<VoucherManagementPage />} />
                <Route path="movies" element={<MovieManagementPage />} />
                <Route path="cinemas" element={<AdminCinemaPage />} />
                <Route path="rooms" element={<RoomManagementPage />} />
                <Route path="showtimes" element={<ShowtimeManagementPage />} />
            </Route>
        </Routes>
    );
}
