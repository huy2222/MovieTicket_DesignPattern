import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import AdminCinemaPage from "../pages/AdminCinemaPage/AdminCinemaPage";
import ProtectedRoute from "./ProtectedRoute";

// Admin
import AdminLayout from "../components/layout/AdminLayout";
import VoucherManagementPage from "../pages/Admin/VoucherManagementPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<VoucherManagementPage />} />
                <Route path="vouchers" element={<VoucherManagementPage />} />
            </Route>

            <Route
                path="/admin/cinemas"
                element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <AdminCinemaPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
