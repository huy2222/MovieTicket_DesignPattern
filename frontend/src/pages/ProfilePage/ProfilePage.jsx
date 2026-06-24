import { useEffect, useState } from "react";
import { getCustomerById } from "../../services/customerService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import EditProfilePage from "./EditProfilePage";

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCustomerById();
        const result = response.data;
        console.log("Fetched customer data:", result);
        setData(result);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
      <Footer />
    </div>
  );

  const handleSave = (updatedForm) => {
    const updatedData = {
      ...data,
      profileCard: {
        ...data.profileCard,
        displayName: updatedForm.displayName,
        age: parseInt(updatedForm.age, 10) || 0
      },
      currentLocation: {
        ...data.currentLocation,
        address: updatedForm.address,
        ward: updatedForm.ward,
        district: updatedForm.district,
        city: updatedForm.city,
        country: updatedForm.country
      }
    };
    console.log("Dữ liệu lưu lại:", updatedData);
    setData(updatedData);
    setEditMode(false);
    // Ở đây có thể tích hợp gọi API cập nhật thông tin khách hàng nếu cần
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between">
      <Header />
      
      <main className="flex-grow py-12 px-4 flex items-center justify-center">
        {editMode ? (
          <EditProfilePage 
            data={data}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all">
            
            {/* Banner trang trí phong cách rạp phim */}
            <div className="h-36 bg-gradient-to-r from-[#e50914] via-[#ff3847] to-[#ffc83b] relative">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
            </div>

            {/* Thân Card */}
            <div className="p-6 sm:p-8 relative pt-0">
              
              {/* Avatar & Tên hiển thị */}
              <div className="flex flex-row items-end gap-5 mb-8 pb-6 border-b border-white/5">
                <div className="w-28 h-28 bg-[#1f1f1f] border-4 border-[#141414] rounded-full shadow-2xl flex items-center justify-center text-[#ffc83b] font-extrabold text-4xl -mt-16 z-10 relative flex-shrink-0">
                  {data.profileCard?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="text-left flex-grow pb-1">
                  <div className="flex flex-row items-center gap-4">
                    <h2 className="text-3xl font-extrabold text-white tracking-wide m-0">
                      {data.profileCard?.displayName || "Chưa đặt tên"}
                    </h2>
                    <div className="flex flex-col items-start gap-1">
                      <span className="bg-[#ffc83b]/10 text-[#ffc83b] border border-[#ffc83b]/25 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider leading-none">
                        Tuổi: {data.profileCard?.age || "N/A"}
                      </span>
                      <span className="bg-white/5 text-slate-400 border border-white/5 px-3 py-0.5 rounded-full text-xs font-semibold leading-none">
                        Thành viên
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin Địa chỉ (Location) */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-white font-bold text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ffc83b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3>Địa chỉ hiện tại</h3>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5 space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Địa chỉ đường</span>
                    <span className="font-semibold text-white">{data.currentLocation?.address || "Chưa cung cấp"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Phường / Xã</span>
                    <span className="font-semibold text-white">{data.currentLocation?.ward || "Chưa cung cấp"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quận / Huyện</span>
                    <span className="font-semibold text-white">{data.currentLocation?.district || "Chưa cung cấp"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Thành phố</span>
                    <span className="font-semibold text-white">{data.currentLocation?.city || "Chưa cung cấp"}</span>
                  </div>
                  <div className="flex justify-between pt-1 items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Quốc gia</span>
                    <span className="inline-block px-3 py-1 bg-white/10 border border-white/10 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                      {data.currentLocation?.country || "Vietnam"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút bấm hành động */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#e50914] to-[#b20710] hover:from-[#ff3847] hover:to-[#e50914] text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-900/30 transition-all duration-300 transform hover:scale-[1.02] text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}