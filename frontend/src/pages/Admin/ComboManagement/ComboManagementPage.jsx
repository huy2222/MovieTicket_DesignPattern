import { useState, useEffect } from "react";
import {
  getAllCombos,
  createCombo,
  updateCombo,
  changeComboStatus,
  deleteCombo,
} from "../../../services/comboAdminService";
import { uploadImage } from "../../../services/uploadService";
import "./ComboManagementPage.css";

export default function ComboManagementPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    isActive: true,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await getAllCombos();
      setCombos(res.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Lỗi khi tải danh sách combo:", err);
      } else {
        setCombos([]); // Xử lý case 404 - Không có dữ liệu
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleOpenModal = (combo = null) => {
    setErrorMsg("");
    if (combo) {
      setEditingId(combo.id);
      setFormData({
        name: combo.name,
        description: combo.description || "",
        price: combo.price,
        imageUrl: combo.imageUrl || "",
        isActive: combo.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg("");
      const response = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        imageUrl: response.data.url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Lỗi khi tải ảnh lên, vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate theo luồng ngoại lệ 6.1
    if (!formData.name.trim()) {
      setErrorMsg("Tên combo không được để trống");
      return;
    }
    if (formData.price < 0) {
      setErrorMsg("Giá combo phải lớn hơn hoặc bằng 0");
      return;
    }

    try {
      if (editingId) {
        await updateCombo(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        await createCombo(formData);
        alert("Thêm mới thành công!");
      }
      handleCloseModal();
      fetchCombos();
    } catch (err) {
      const msg = err.response?.data?.message || "Cập nhật thông tin combo thất bại. Vui lòng thử lại sau.";
      setErrorMsg(msg);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await changeComboStatus(id, !currentStatus);
      fetchCombos();
    } catch (err) {
      alert("Cập nhật thông tin combo thất bại. Vui lòng thử lại sau.");
    }
  };

  const handleDelete = async (combo) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa combo "${combo.name}"?`)) return;
    
    try {
      await deleteCombo(combo.id);
      alert("Đã xóa thành công!");
      fetchCombos();
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể xóa combo này, có thể combo đang được sử dụng.";
      alert(msg);
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="combo-management-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="movie-page-title-icon">🍿</span>
          Quản lý Combo Bắp Nước
        </h2>
        <button className="btn-create" onClick={() => handleOpenModal()}>
          <span>＋</span> Thêm mới Combo
        </button>
      </div>

      <div className="combo-list">
        {combos.length === 0 ? (
          <div className="no-data">Không có dữ liệu combo</div>
        ) : (
          <table className="combo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Combo</th>
                <th>Giá</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((combo) => (
                <tr key={combo.id}>
                  <td>{combo.id}</td>
                  <td className="font-semibold">{combo.name}</td>
                  <td className="text-primary font-bold">
                    {combo.price.toLocaleString("vi-VN")} đ
                  </td>
                  <td>{combo.description}</td>
                  <td>
                    <span className={`status-badge ${combo.isActive ? "active" : "inactive"}`}>
                      {combo.isActive ? "Đang bán" : "Ngừng bán"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleOpenModal(combo)}>
                        ✏️ Sửa
                      </button>
                      <button
                        className={`btn-toggle ${combo.isActive ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleStatus(combo.id, combo.isActive)}
                      >
                        {combo.isActive ? "⏹ Ngừng bán" : "▶️ Mở bán lại"}
                      </button>
                      <button className="btn-action btn-danger" onClick={() => handleDelete(combo)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingId ? "Chỉnh sửa Combo" : "Thêm mới Combo"}</h3>
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Combo (*)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Combo 2 Bắp 1 Nước"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Giá (VNĐ) (*)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="file-input"
                  />
                  {isUploading && <span className="upload-loading">Đang tải...</span>}
                </div>
                {formData.imageUrl && (
                  <div className="image-preview" style={{ marginTop: "10px" }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ height: "60px", borderRadius: "4px" }} />
                  </div>
                )}
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Mở bán (Active)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
