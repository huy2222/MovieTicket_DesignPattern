import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage/HomePage";
// import MoviePage from "../pages/MoviePage/MoviePage";
// import BookingPage from "../pages/BookingPage/BookingPage";
// import AccountPage from "../pages/AccountPage/AccountPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/movies" element={<MoviePage />} />
            <Route path="/bookings" element={<BookingPage />} />
            <Route path="/account" element={<AccountPage />} /> */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    );
}