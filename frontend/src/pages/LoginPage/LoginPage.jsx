import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      const user = response.data;

      // Lưu thông tin user
      localStorage.setItem("token", user.token);
      // Lưu thông tin user vào localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        }),
      );
      console.log(response.data);
      console.log(response.data.token);
      // navigate("/");
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        console.log("User role:", user.role);
        navigate("/");
      }
    } catch (err) {
      console.error(err);

      if (err.response) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        setError("Không thể kết nối tới máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>CineMax</h1>
          <p>Đăng nhập vào tài khoản của bạn</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <span>Ghi nhớ tài khoản</span>
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="forgot-password">
          <Link to="#">Quên mật khẩu?</Link>
        </div>

        <div className="register-link">
          Chưa có tài khoản?
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
