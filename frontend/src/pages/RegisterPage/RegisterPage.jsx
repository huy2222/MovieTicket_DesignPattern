import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { register } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiError";

const normalizePhoneNumber = (phone) => {
  const value = phone.trim();
  if (value.startsWith("+84")) return `0${value.slice(3)}`;
  if (value.startsWith("84") && value.length === 11) return `0${value.slice(2)}`;
  return value;
};

// Kiểm tra định dạng số điện thoại hợp lệ (phải gồm 10 chữ số bắt đầu bằng 0 hoặc định dạng +84)
const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return "Số điện thoại không được để trống.";
  const normalized = normalizePhoneNumber(phone);
  if (!/^0[0-9]{9}$/.test(normalized)) {
    return "Số điện thoại không đúng định dạng (phải gồm 10 chữ số bắt đầu bằng số 0).";
  }
  return "";
};

// Kiểm tra định dạng email hợp lệ
const validateEmail = (email) => {
  if (!email || !email.trim()) return "Email không được để trống.";
  const value = email.trim();
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Email không đúng định dạng.";
  }
  return "";
};

const validateFullName = (fullName) => {
  const value = fullName.trim();
  if (!value) return "Họ và tên không được để trống.";
  if (value.length < 2 || value.length > 100) return "Họ và tên phải từ 2 đến 100 ký tự.";
  return "";
};

const validatePassword = (password) => {
  if (!password) return "Mật khẩu không được để trống.";
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (new TextEncoder().encode(password).length > 72) return "Mật khẩu không được vượt quá 72 ký tự.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.";
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
  const [fullNameError, setFullNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "phone") {
      if (value.trim().length > 0) {
        setPhoneError(validatePhoneNumber(value));
      } else {
        setPhoneError("");
      }
      setError("");
      return;
    }

    if (name === "email") {
      if (emailError) {
        setEmailError("");
      }
      setError("");
      return;
    }

    if (name === "fullName" && fullNameError) setFullNameError("");
    if (name === "password") {
      if (passwordError) setPasswordError("");
      if (confirmPasswordError) setConfirmPasswordError("");
    }
    if (name === "confirmPassword" && confirmPasswordError) setConfirmPasswordError("");

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

  const handleFullNameBlur = () => setFullNameError(validateFullName(formData.fullName));
  const handlePasswordBlur = () => setPasswordError(validatePassword(formData.password));
  const handleConfirmPasswordBlur = () => {
    if (!formData.confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu.");
    } else if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullNameValidationMsg = validateFullName(formData.fullName);
    const phoneValidationMsg = validatePhoneNumber(formData.phone);
    const emailValidationMsg = validateEmail(formData.email);
    const passwordValidationMsg = validatePassword(formData.password);
    const confirmPasswordValidationMsg = !formData.confirmPassword
      ? "Vui lòng xác nhận mật khẩu."
      : formData.password !== formData.confirmPassword
        ? "Mật khẩu xác nhận không khớp."
        : "";

    setFullNameError(fullNameValidationMsg);
    setPhoneError(phoneValidationMsg);
    setEmailError(emailValidationMsg);
    setPasswordError(passwordValidationMsg);
    setConfirmPasswordError(confirmPasswordValidationMsg);

    if (
      fullNameValidationMsg ||
      phoneValidationMsg ||
      emailValidationMsg ||
      passwordValidationMsg ||
      confirmPasswordValidationMsg
    ) {
      setError("Vui lòng kiểm tra lại thông tin đăng ký.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: normalizePhoneNumber(formData.phone),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await register(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      let msgStr;

      if (!err.response) {
        msgStr = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.";
      } else if (status === 429) {
        msgStr = "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
      } else if (status >= 500) {
        msgStr = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
      } else {
        msgStr = getApiErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại.");
      }

      setError(msgStr);

      const normalizedMessage = msgStr.toLowerCase();
      if (normalizedMessage.includes("email")) {
        setEmailError(msgStr);
      } else if (
        normalizedMessage.includes("số điện thoại") ||
        normalizedMessage.includes("phone")
      ) {
        setPhoneError(msgStr);
      } else if (normalizedMessage.includes("họ và tên")) {
        setFullNameError(msgStr);
      } else if (normalizedMessage.includes("mật khẩu")) {
        setPasswordError(msgStr);
      }
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="register-full-name">Họ và tên</label>

            <input
              id="register-full-name"
              data-testid="register-full-name"
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleFullNameBlur}
              autoComplete="name"
              maxLength={100}
              aria-invalid={Boolean(fullNameError)}
              className={fullNameError ? "input-invalid" : ""}
            />
            {fullNameError && <span className="field-error-text">{fullNameError}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="register-phone">Số điện thoại</label>

            <input
              id="register-phone"
              data-testid="register-phone"
              type="tel"
              name="phone"
              maxLength={15}
              placeholder="Nhập số điện thoại (10 số, bắt đầu bằng 0)"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              autoComplete="tel"
              inputMode="tel"
              className={phoneError ? "input-invalid" : ""}
              aria-invalid={Boolean(phoneError)}
            />
            {phoneError && <span className="field-error-text">{phoneError}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
              data-testid="register-email"
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              autoComplete="email"
              maxLength={254}
              className={emailError ? "input-invalid" : ""}
              aria-invalid={Boolean(emailError)}
            />
            {emailError && <span className="field-error-text">{emailError}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="register-password">Mật khẩu</label>

            <input
              id="register-password"
              data-testid="register-password"
              type="password"
              name="password"
              placeholder="Ít nhất 8 ký tự, có chữ hoa, chữ thường và số"
              value={formData.password}
              onChange={handleChange}
              onBlur={handlePasswordBlur}
              autoComplete="new-password"
              maxLength={72}
              aria-invalid={Boolean(passwordError)}
              className={passwordError ? "input-invalid" : ""}
            />
            {passwordError && <span className="field-error-text">{passwordError}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>

            <input
              id="register-confirm-password"
              data-testid="register-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleConfirmPasswordBlur}
              autoComplete="new-password"
              maxLength={72}
              aria-invalid={Boolean(confirmPasswordError)}
              className={confirmPasswordError ? "input-invalid" : ""}
            />
            {confirmPasswordError && <span className="field-error-text">{confirmPasswordError}</span>}
          </div>

          <button
            type="submit"
            id="register-submit"
            data-testid="register-submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="login-link">
          Đã có tài khoản?
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
