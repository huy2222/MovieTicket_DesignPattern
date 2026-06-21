import { useState, useEffect } from "react";
import {
  createVoucher,
  updateVoucher,
} from "../../services/voucherService";
import "./VoucherFormModal.css";

// ============================================
// Voucher Type Options
// ============================================
const VOUCHER_TYPES = [
  {
    value: "PERCENT_DISCOUNT",
    label: "Giảm giá theo %",
    desc: "Giảm một phần trăm trên tổng giá vé (VD: giảm 20%)",
  },
  {
    value: "BUY_N_GET_FREE",
    label: "Mua N tặng M",
    desc: "Mua N vé thì được tặng thêm M vé miễn phí",
  },
  {
    value: "MIN_TICKET_DISCOUNT",
    label: "Giảm % khi mua tối thiểu N vé",
    desc: "Chỉ giảm giá khi khách mua đủ số lượng vé tối thiểu",
  },
];

// ============================================
// Initial form state
// ============================================
const INITIAL_FORM = {
  name: "",
  code: "",
  description: "",
  voucherType: "PERCENT_DISCOUNT",
  discountPercent: "",
  buyQuantity: "",
  freeQuantity: "",
  minTickets: "",
  minimumOrderAmount: "",
  usageLimit: "",
  startTime: "",
  endTime: "",
};

// ============================================
// Component
// ============================================
export default function VoucherFormModal({ voucher, onClose, onSuccess }) {
  const isEditing = !!voucher;
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form khi edit
  useEffect(() => {
    if (voucher) {
      setForm({
        name: voucher.name || "",
        code: voucher.code || "",
        description: voucher.description || "",
        voucherType: voucher.voucherType || "PERCENT_DISCOUNT",
        discountPercent: voucher.discountPercent ?? "",
        buyQuantity: voucher.buyQuantity ?? "",
        freeQuantity: voucher.freeQuantity ?? "",
        minTickets: voucher.minTickets ?? "",
        minimumOrderAmount: voucher.minimumOrderAmount ?? "",
        usageLimit: voucher.usageLimit ?? "",
        startTime: voucher.startTime
          ? voucher.startTime.substring(0, 16)
          : "",
        endTime: voucher.endTime ? voucher.endTime.substring(0, 16) : "",
      });
    }
  }, [voucher]);

  // ---- Handlers ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error khi user sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      voucherType: type,
      // Reset các field type-specific
      discountPercent: "",
      buyQuantity: "",
      freeQuantity: "",
      minTickets: "",
    }));
    setErrors({});
  };

  // ---- Validate ----
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) errs.name = "Vui lòng nhập tên voucher";
    if (!form.code.trim()) errs.code = "Vui lòng nhập mã voucher";
    if (!form.startTime) errs.startTime = "Vui lòng chọn ngày bắt đầu";
    if (!form.endTime) errs.endTime = "Vui lòng chọn ngày kết thúc";

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errs.endTime = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    // Validate theo loại
    if (form.voucherType === "PERCENT_DISCOUNT") {
      const pct = Number(form.discountPercent);
      if (!form.discountPercent || pct <= 0 || pct > 100) {
        errs.discountPercent = "Phần trăm giảm phải từ 1 đến 100";
      }
    }

    if (form.voucherType === "BUY_N_GET_FREE") {
      if (!form.buyQuantity || Number(form.buyQuantity) < 1) {
        errs.buyQuantity = "Số vé mua phải ≥ 1";
      }
      if (!form.freeQuantity || Number(form.freeQuantity) < 1) {
        errs.freeQuantity = "Số vé tặng phải ≥ 1";
      }
    }

    if (form.voucherType === "MIN_TICKET_DISCOUNT") {
      if (!form.minTickets || Number(form.minTickets) < 1) {
        errs.minTickets = "Số vé tối thiểu phải ≥ 1";
      }
      const pct = Number(form.discountPercent);
      if (!form.discountPercent || pct <= 0 || pct > 100) {
        errs.discountPercent = "Phần trăm giảm phải từ 1 đến 100";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      voucherType: form.voucherType,
      discountPercent:
        form.voucherType === "PERCENT_DISCOUNT" ||
        form.voucherType === "MIN_TICKET_DISCOUNT"
          ? Number(form.discountPercent)
          : null,
      buyQuantity:
        form.voucherType === "BUY_N_GET_FREE"
          ? Number(form.buyQuantity)
          : null,
      freeQuantity:
        form.voucherType === "BUY_N_GET_FREE"
          ? Number(form.freeQuantity)
          : null,
      minTickets:
        form.voucherType === "MIN_TICKET_DISCOUNT"
          ? Number(form.minTickets)
          : null,
      minimumOrderAmount: form.minimumOrderAmount
        ? Number(form.minimumOrderAmount)
        : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startTime: form.startTime,
      endTime: form.endTime,
    };

    try {
      setSaving(true);
      if (isEditing) {
        await updateVoucher(voucher.id, payload);
        onSuccess("Cập nhật voucher thành công!");
      } else {
        await createVoucher(payload);
        onSuccess("Tạo voucher mới thành công!");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data || "Có lỗi xảy ra";
      setErrors({ submit: msg });
    } finally {
      setSaving(false);
    }
  };

  // ---- Close on overlay click ----
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ---- Render ----
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? "✏️ Chỉnh sửa Voucher" : "🎫 Tạo Voucher Mới"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Submit error */}
            {errors.submit && (
              <div className="form-error" style={{ fontSize: "0.85rem" }}>
                ❌ {errors.submit}
              </div>
            )}

            {/* Tên */}
            <div className="form-group">
              <label className="form-label">Tên voucher</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Giảm 20% mua 2 vé"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Mã */}
            <div className="form-group">
              <label className="form-label">Mã voucher</label>
              <input
                className="form-input"
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="VD: SALE20"
                style={{ textTransform: "uppercase", letterSpacing: "1px" }}
              />
              {errors.code && <span className="form-error">{errors.code}</span>}
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn về voucher..."
              />
            </div>

            {/* ===== Loại khuyến mãi ===== */}
            <div className="form-section">
              <div className="form-section-title">Loại khuyến mãi</div>
              <div className="voucher-type-options">
                {VOUCHER_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`voucher-type-option ${
                      form.voucherType === type.value ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="voucherType"
                      value={type.value}
                      checked={form.voucherType === type.value}
                      onChange={() => handleTypeChange(type.value)}
                    />
                    <div className="voucher-type-option-content">
                      <div className="voucher-type-option-label">
                        {type.label}
                      </div>
                      <div className="voucher-type-option-desc">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ===== Conditional Fields ===== */}
            <div className="type-specific-fields">
              {/* PERCENT_DISCOUNT */}
              {form.voucherType === "PERCENT_DISCOUNT" && (
                <div className="form-group">
                  <label className="form-label">Phần trăm giảm giá</label>
                  <div className="form-input-wrapper">
                    <input
                      className="form-input"
                      type="number"
                      name="discountPercent"
                      value={form.discountPercent}
                      onChange={handleChange}
                      placeholder="20"
                      min="1"
                      max="100"
                    />
                    <span className="form-input-suffix">%</span>
                  </div>
                  {errors.discountPercent && (
                    <span className="form-error">{errors.discountPercent}</span>
                  )}
                </div>
              )}

              {/* BUY_N_GET_FREE */}
              {form.voucherType === "BUY_N_GET_FREE" && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mua (N vé)</label>
                    <input
                      className="form-input"
                      type="number"
                      name="buyQuantity"
                      value={form.buyQuantity}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                    />
                    {errors.buyQuantity && (
                      <span className="form-error">{errors.buyQuantity}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tặng (M vé)</label>
                    <input
                      className="form-input"
                      type="number"
                      name="freeQuantity"
                      value={form.freeQuantity}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                    />
                    {errors.freeQuantity && (
                      <span className="form-error">{errors.freeQuantity}</span>
                    )}
                  </div>
                </div>
              )}

              {/* MIN_TICKET_DISCOUNT */}
              {form.voucherType === "MIN_TICKET_DISCOUNT" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Số vé tối thiểu</label>
                    <input
                      className="form-input"
                      type="number"
                      name="minTickets"
                      value={form.minTickets}
                      onChange={handleChange}
                      placeholder="2"
                      min="1"
                    />
                    {errors.minTickets && (
                      <span className="form-error">{errors.minTickets}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phần trăm giảm giá</label>
                    <div className="form-input-wrapper">
                      <input
                        className="form-input"
                        type="number"
                        name="discountPercent"
                        value={form.discountPercent}
                        onChange={handleChange}
                        placeholder="20"
                        min="1"
                        max="100"
                      />
                      <span className="form-input-suffix">%</span>
                    </div>
                    {errors.discountPercent && (
                      <span className="form-error">
                        {errors.discountPercent}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ===== Điều kiện áp dụng ===== */}
            <div className="form-section">
              <div className="form-section-title">Điều kiện áp dụng</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Đơn tối thiểu (VNĐ)</label>
                <input
                  className="form-input"
                  type="number"
                  name="minimumOrderAmount"
                  value={form.minimumOrderAmount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Giới hạn sử dụng</label>
                <input
                  className="form-input"
                  type="number"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ngày bắt đầu</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
                {errors.startTime && (
                  <span className="form-error">{errors.startTime}</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Ngày kết thúc</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
                {errors.endTime && (
                  <span className="form-error">{errors.endTime}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="btn-modal-save"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : isEditing
                ? "Cập nhật"
                : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
