import { useState, useEffect } from "react";
import { updateProfile } from "../../services/customerService";
import { updateAvatar } from "../../services/customerService"; // Import hàm updateAvatar
import { getGenres } from "../../services/genreService";
// Import các hàm lấy dữ liệu từ thư viện sub-vn
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "sub-vn";

const MAX_AVATAR_SIZE = 15 * 1024 * 1024;

export default function EditProfilePage({ data, onSave, onCancel }) {
  const initialFavoriteGenreIds = data?.profileCard?.favoriteGenreIds
    ?? data?.profileCard?.favoriteGenres?.map((genre) => genre.id)
    ?? [];
  const [form, setForm] = useState({
    fullName: data?.fullName || "",
    age: data?.profileCard?.age || "",
    bio: data?.profileCard?.bio || "",
    address: data?.currentLocation?.address || "",
    ward: data?.currentLocation?.ward || "",
    district: data?.currentLocation?.district || "",
    city: data?.currentLocation?.city || "",
    country: data?.currentLocation?.country || "Vietnam",
  });

  // Quản lý danh sách để hiển thị ra thẻ <select>
  const [provinces] = useState(() => getProvinces());
  const [districts, setDistricts] = useState(() => {
    const province = getProvinces().find((item) => item.name === data?.currentLocation?.city);
    return province ? getDistrictsByProvinceCode(province.code) : [];
  });
  const [wards, setWards] = useState(() => {
    const province = getProvinces().find((item) => item.name === data?.currentLocation?.city);
    if (!province) return [];
    const district = getDistrictsByProvinceCode(province.code)
      .find((item) => item.name === data?.currentLocation?.district);
    return district ? getWardsByDistrictCode(district.code) : [];
  });
  const [genreOptions, setGenreOptions] = useState(data?.profileCard?.favoriteGenres ?? []);
  const [favoriteGenreIds, setFavoriteGenreIds] = useState(initialFavoriteGenreIds);
  const [genreError, setGenreError] = useState("");

  // Avatar states
  const [avatar, setAvatar] = useState(null); // Sửa chính tả từ avata -> avatar
  const [preview, setPreview] = useState(data?.profileCard?.avatarUrl || null);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    let active = true;
    getGenres()
      .then(({ data: genres }) => {
        if (active) setGenreOptions(genres ?? []);
      })
      .catch(() => {
        if (active) setGenreError("Không tải được danh sách thể loại phim.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Xử lý riêng khi đổi Tỉnh/Thành phố
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    if (!cityName) {
      setForm({ ...form, city: "", district: "", ward: "" });
      setDistricts([]);
      setWards([]);
      return;
    }

    const selectedProvince = provinces.find((p) => p.name === cityName);
    const districtList = getDistrictsByProvinceCode(selectedProvince.code);

    setDistricts(districtList);
    setWards([]); // Reset xã
    setForm({
      ...form,
      city: cityName,
      district: "", // Reset quận huyện trên form
      ward: "", // Reset phường xã trên form
    });
  };

  // Xử lý riêng khi đổi Quận/Huyện
  const handleDistrictChange = (e) => {
    const districtName = e.target.value;
    if (!districtName) {
      setForm({ ...form, district: "", ward: "" });
      setWards([]);
      return;
    }

    const selectedDistrict = districts.find((d) => d.name === districtName);
    const wardList = getWardsByDistrictCode(selectedDistrict.code);

    setWards(wardList);
    setForm({
      ...form,
      district: districtName,
      ward: "", // Reset phường xã trên form
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatar(null);
      setAvatarError("Ảnh đại diện không được vượt quá 15MB.");
      e.target.value = "";
      return;
    }
    setAvatarError("");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleFavoriteGenre = (genreId) => {
    setFavoriteGenreIds((current) =>
      current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optimistic update: đóng form ngay lập tức với dữ liệu local
    const optimisticData = {
      ...data,
      fullName: form.fullName,
      profileCard: {
        ...data?.profileCard,
        age: Number(form.age) || 0,
        bio: form.bio,
        avatarUrl: preview,
        favoriteGenreIds,
        favoriteGenres: genreOptions.filter((genre) => favoriteGenreIds.includes(genre.id)),
      },
      currentLocation: {
        ...data?.currentLocation,
        address: form.address,
        ward: form.ward,
        district: form.district,
        city: form.city,
        country: form.country,
      },
    };
    if (onSave) onSave(optimisticData);

    // Gọi API trong background
    try {
      const payload = {
        fullName: form.fullName,
        profileCard: {
          age: Number(form.age) || 0,
          bio: form.bio,
          favoriteGenreIds,
        },
        currentLocation: {
          address: form.address,
          ward: form.ward,
          district: form.district,
          city: form.city,
          country: form.country,
        },
      };

      let finalData;
      if (avatar) {
        // Upload avatar first to save the new avatar URL
        await updateAvatar(avatar);
        // Then update other profile details, returning the most up-to-date document
        const profileRes = await updateProfile(payload);
        finalData = profileRes.data;
      } else {
        const profileRes = await updateProfile(payload);
        finalData = profileRes.data;
      }

      // Sync the final backend data (e.g. Cloudinary image URLs) back to the parent state
      if (onSave) onSave(finalData);
      console.log("Profile updated successfully");
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

          {/* Giao diện hiển thị và chọn Avatar */}
          <div className="flex flex-col items-center mb-6 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <img
              src={preview || "/default-avatar.png"}
              alt="Avatar Preview"
              className="w-32 h-32 rounded-full object-cover border border-white/10 shadow-md"
            />
            <p className="mt-3 text-xs font-semibold text-slate-300">Ảnh đại diện</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Hỗ trợ ảnh JPG, PNG, WEBP. Dung lượng tối đa 15MB.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-3 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-slate-300 hover:file:bg-white/10 cursor-pointer"
            />
            {avatarError ? (
              <p className="mt-2 text-xs font-semibold text-[#ff6b74]">{avatarError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Tên hiển thị
              </label>
              <input
                name="fullName"
                value={form.fullName}
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

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Giới thiệu bản thân (Bio)
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Viết vài điều về bạn..."
              className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Thể loại phim yêu thích
            </label>
            <p className="mb-3 text-xs text-slate-500">
              Sở thích này sẽ được hiển thị cho người khác khi khám phá hoặc match trên CineMeet.
            </p>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((genre) => {
                const selected = favoriteGenreIds.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleFavoriteGenre(genre.id)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-[#e50914] bg-[#e50914]/20 text-[#ff7d85]"
                        : "border-white/10 bg-[#1a1a1a] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {genre.name}
                  </button>
                );
              })}
            </div>
            {genreOptions.length === 0 && !genreError ? (
              <p className="text-xs text-slate-500">Đang tải danh sách thể loại...</p>
            ) : null}
            {genreError ? <p className="mt-2 text-xs text-[#ff6b74]">{genreError}</p> : null}
          </div>

        </div>

        <hr className="border-white/5" />

        {/* PHẦN ĐIỀU CHỈNH ĐỊA CHỈ NÂNG CAO */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#ffc83b] uppercase tracking-widest">
            Địa chỉ liên hệ
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Tỉnh / Thành phố */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Thành phố / Tỉnh
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleCityChange}
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold text-slate-300"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quận / Huyện
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleDistrictChange}
                  disabled={!form.city}
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold disabled:opacity-40 text-slate-300"
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Phường / Xã */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Phường / Xã
                </label>
                <select
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  disabled={!form.district}
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold disabled:opacity-40 text-slate-300"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quốc gia */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quốc gia
                </label>
                <input
                  name="country"
                  value={form.country}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-slate-400 text-sm font-semibold opacity-60"
                />
              </div>
            </div>

            {/* Địa chỉ chi tiết */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Số nhà, tên đường
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Ví dụ: 123 Nguyễn Huệ..."
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#ff3847] focus:ring-2 focus:ring-[#ff3847]/10 transition-all text-sm font-semibold"
              />
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
