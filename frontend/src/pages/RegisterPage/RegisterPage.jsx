import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        email: formData.email,
        password: formData.password,
      };

      const response = await register(payload);
      console.log(response.data);

      navigate("/login");
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>MovieHub</h1>
          <p>Tạo tài khoản mới</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Họ và tên</label>

            <input
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Số điện thoại</label>

            <input
              type="text"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>

            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button className="register-btn">Đăng ký</button>
        </form>

        <div className="login-link">
          Đã có tài khoản?
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
