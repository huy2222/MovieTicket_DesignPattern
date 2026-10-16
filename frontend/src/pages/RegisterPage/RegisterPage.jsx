import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";

// Chuyển và chuẩn hóa số điện thoại theo định dạng chuẩn Việt Nam (10 chữ số bắt đầu bằng 0)
const formatPhoneNumber = (value) => {
  if (!value) return "";
  let cleaned = value.trim();
  // Chuyển +84 hoặc 84 ở đầu thành 0
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length > 9) {
    cleaned = "0" + cleaned.slice(2);
  }
  // Chỉ giữ lại ký tự số và giới hạn tối đa 10 chữ số
  return cleaned.replace(/\D/g, "").slice(0, 10);
};

// Kiểm tra định dạng số điện thoại hợp lệ
const validatePhoneNumber = (phone) => {
  if (!phone) return "Số điện thoại không được để trống.";
  if (!/^0[0-9]{9}$/.test(phone)) {
    return "Số điện thoại không đúng định dạng. Vui lòng nhập đúng 10 chữ số bắt đầu bằng số 0 (Ví dụ: 0912345678).";
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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phone: formattedPhone,
      }));

      if (formattedPhone.length > 0) {
        if (!formattedPhone.startsWith("0")) {
          setPhoneError("Số điện thoại không đúng định dạng (phải bắt đầu bằng chữ số 0).");
        } else if (formattedPhone.length < 10) {
          setPhoneError("Số điện thoại không đúng định dạng (phải có đủ 10 chữ số).");
        } else {
          setPhoneError("");
        }
      } else {
        setPhoneError("");
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
    if (!formData.phone) {
      setPhoneError("Vui lòng nhập số điện thoại.");
    } else {
      setPhoneError(validatePhoneNumber(formData.phone));
    }
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

    const phoneValidationMsg = validatePhoneNumber(formData.phone);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      setError(phoneValidationMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await register(payload);
      console.log(response.data);

      navigate("/login");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setError(typeof serverMsg === "string" ? serverMsg : "Đăng ký thất bại. Vui lòng thử lại.");
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
              maxLength={10}
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
