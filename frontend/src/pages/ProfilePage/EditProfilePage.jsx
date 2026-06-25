import { useState } from "react";
import { updateProfile } from "../../services/customerService";

export default function EditProfilePage({ data, onSave, onCancel }) {
  const [form, setForm] = useState({
    displayName: data?.profileCard?.displayName || "",
    age: data?.profileCard?.age || "",
    address: data?.currentLocation?.address || "",
    ward: data?.currentLocation?.ward || "",
    district: data?.currentLocation?.district || "",
    city: data?.currentLocation?.city || "",
    country: data?.currentLocation?.country || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Chống reload trang bất ngờ
    // onSave(form); // Gọi callback onSave nếu có
    try {
      const payload = {
        profileCard: {
          displayName: form.displayName,
          age: Number(form.age),
        },
        currentLocation: {
          address: form.address,
          ward: form.ward,
          district: form.district,
          city: form.city,
          country: form.country,
        },
      };

      const response = await updateProfile(payload);
      const updatedData = response.data;
      setForm(updatedData);
      if (onSave) {
        onSave(updatedData);
      }
      console.log("Profile updated successfully:", updatedData);
    } catch (error) {
      console.error("Error updating profile data:", error);
    }
  };

  return (
    <div className="w-full max-w-xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
      <div className="mb-6 border-b border-white/5 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          Chỉnh sửa thông tin hồ sơ
        </h2>
        <p className="text-xs text-slate-400 mt-1.5">
          Cập nhật thông tin thẻ thành viên và địa chỉ liên lạc của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PHẦN THÔNG TIN CÁ NHÂN */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#ffc83b] uppercase tracking-widest">
            Thẻ thành viên
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Tên hiển thị
              </label>
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Nhập tên hiển thị..."
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Tuổi
              </label>
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                placeholder="Nhập tuổi..."
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* PHẦN ĐỊA CHỈ */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#ffc83b] uppercase tracking-widest">
            Địa chỉ liên hệ
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Địa chỉ đường
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Ví dụ: 123 Nguyễn Huệ..."
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Phường / Xã
                </label>
                <input
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="Nhập phường..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quận / Huyện
                </label>
                <input
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="Nhập quận..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Thành phố
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Nhập thành phố..."
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quốc gia
                </label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Vietnam"
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* HÀNH ĐỘNG BUTTONS */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold px-5 py-2.5 rounded-xl transition-colors text-sm border border-white/5"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#e50914] to-[#b20710] hover:from-[#ff3847] hover:to-[#e50914] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-900/30 transition-all duration-300 transform hover:scale-[1.02] text-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
