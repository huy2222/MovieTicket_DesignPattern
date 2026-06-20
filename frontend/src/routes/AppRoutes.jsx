import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";

// Admin
import AdminLayout from "../components/layout/AdminLayout";
import VoucherManagementPage from "../pages/Admin/VoucherManagementPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<VoucherManagementPage />} />
                <Route path="vouchers" element={<VoucherManagementPage />} />
            </Route>
        </Routes>
    );
}