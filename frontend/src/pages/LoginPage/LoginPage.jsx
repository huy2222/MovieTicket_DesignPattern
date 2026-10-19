import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./LoginPage.css";

const validateEmail = (email) => {
  const value = email.trim();
  if (!value) return "Vui lòng nhập email.";
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Email không đúng định dạng.";
  }
  return "";
};

export default function LoginPage() {
  const navigate = useNavigate();
  const rememberedEmail = localStorage.getItem("rememberedLoginEmail") || "";

  const [formData, setFormData] = useState({
    email: rememberedEmail,
    password: "",
    rememberMe: Boolean(rememberedEmail),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {
      email: validateEmail(formData.email),
      password: formData.password ? "" : "Vui lòng nhập mật khẩu.",
    };

    if (validationErrors.email || validationErrors.password) {
      setFieldErrors(validationErrors);
      setError("Vui lòng kiểm tra lại thông tin đăng nhập.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const user = response.data;
      if (!user?.token || !user?.id || !user?.role) {
        setError("Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.");
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem("rememberedLoginEmail", formData.email.trim().toLowerCase());
      } else {
        localStorage.removeItem("rememberedLoginEmail");
      }

      localStorage.setItem("token", user.token);
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

      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.role === "STAFF") {
        navigate("/staff/combos", { replace: true });
      } else if (user.role === "CUSTOMER") {
        navigate("/", { replace: true });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Tài khoản không có quyền truy cập hợp lệ.");
      }
    } catch (err) {
      const status = err.response?.status;
      if (!err.response) {
        setError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
      } else if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Email hoặc mật khẩu không đúng.");
      } else if (status === 403) {
        setError(getApiErrorMessage(err, "Tài khoản không được phép đăng nhập."));
      } else if (status === 429) {
        setError("Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.");
      } else if (status >= 500) {
        setError("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
      } else {
        setError(getApiErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại."));
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              data-testid="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => setFieldErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }))}
              placeholder="Nhập email"
              autoComplete="email"
              maxLength={254}
              aria-invalid={Boolean(fieldErrors.email)}
              className={fieldErrors.email ? "input-invalid" : ""}
            />
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Mật khẩu</label>

            <input
              id="login-password"
              data-testid="login-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => setFieldErrors((prev) => ({
                ...prev,
                password: formData.password ? "" : "Vui lòng nhập mật khẩu.",
              }))}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              maxLength={72}
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? "input-invalid" : ""}
            />
            {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              id="remember-me"
            />
            <label htmlFor="remember-me">Ghi nhớ email</label>
          </div>

          <button type="submit" id="login-submit" data-testid="login-submit" className="login-btn" disabled={loading}>
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
