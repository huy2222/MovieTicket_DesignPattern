import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { register } from "../../services/authService";

// Kiểm tra định dạng số điện thoại hợp lệ (phải gồm 10 chữ số bắt đầu bằng 0 hoặc định dạng +84)
const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return "Số điện thoại không được để trống.";
  const trimmed = phone.trim();
  let normalized = trimmed;
  if (normalized.startsWith("+84")) {
    normalized = "0" + normalized.slice(3);
  } else if (normalized.startsWith("84") && normalized.length === 11) {
    normalized = "0" + normalized.slice(2);
  }
  if (!/^0[0-9]{9}$/.test(normalized)) {
    return "Số điện thoại không đúng định dạng (phải gồm 10 chữ số bắt đầu bằng số 0).";
  }
  return "";
};

// Kiểm tra định dạng email hợp lệ
const validateEmail = (email) => {
  if (!email || !email.trim()) return "Email không được để trống.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Email không đúng định dạng.";
  }
  return "";
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));

      if (value.trim().length > 0) {
        setPhoneError(validatePhoneNumber(value));
      } else {
        setPhoneError("");
      }
      setError("");
      return;
    }

    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        email: value,
      }));
      if (emailError) {
        setEmailError("");
      }
      setError("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handlePhoneBlur = () => {
    if (!formData.phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại.");
    } else {
      setPhoneError(validatePhoneNumber(formData.phone));
    }
  };

  const handleEmailBlur = () => {
    if (!formData.email.trim()) {
      setEmailError("Vui lòng nhập email.");
    } else {
      setEmailError(validateEmail(formData.email));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const phoneValidationMsg = validatePhoneNumber(formData.phone);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      setError(phoneValidationMsg);
      return;
    }

    const emailValidationMsg = validateEmail(formData.email);
    if (emailValidationMsg) {
      setEmailError(emailValidationMsg);
      setError(emailValidationMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      let phone = formData.phone.trim();
      if (phone.startsWith("+84")) {
        phone = "0" + phone.slice(3);
      } else if (phone.startsWith("84") && phone.length === 11) {
        phone = "0" + phone.slice(2);
      }

      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: phone,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await register(payload);
      navigate("/login");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      const msgStr = typeof serverMsg === "string" ? serverMsg : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(msgStr);

      if (msgStr.toLowerCase().includes("email")) {
        setEmailError(msgStr);
      } else if (
        msgStr.toLowerCase().includes("số điện thoại") ||
        msgStr.toLowerCase().includes("phone")
      ) {
        setPhoneError(msgStr);
      }
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
              type="tel"
              name="phone"
              maxLength={15}
              placeholder="Nhập số điện thoại (10 số, bắt đầu bằng 0)"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              className={phoneError ? "input-invalid" : ""}
            />
            {phoneError && <span className="field-error-text">{phoneError}</span>}
          </div>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              className={emailError ? "input-invalid" : ""}
            />
            {emailError && <span className="field-error-text">{emailError}</span>}
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
