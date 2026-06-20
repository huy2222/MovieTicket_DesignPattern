import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
        // dùng khi muốn chặn khi chưa login
    //     <Routes>

    //   {/* public route */}
    //   <Route path="/login" element={<LoginPage />} />

    //   {/* public home (tuỳ bạn) */}
    //   <Route path="/" element={<HomePage />} />

    //   {/* protected route */}
    //   <Route
    //     path="/booking"
    //     element={
    //       <ProtectedRoute>
    //         <BookingPage />
    //       </ProtectedRoute>
    //     }
    //   />

    // </Routes>
    );
}