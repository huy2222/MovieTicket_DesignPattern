import { useEffect, useState } from "react";
import { getProfile } from "../../services/customerService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import EditProfilePage from "./EditProfilePage";

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProfile();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data)
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">Đang tải hồ sơ...</span>
          </div>
        </div>
        <Footer />
      </div>
    );

  const handleSave = (updatedData) => {
    setData(updatedData);
    setEditMode(false);
  };

  const handleCancel = () => setEditMode(false);

  const initials = data.profileCard?.displayName?.charAt(0).toUpperCase() || "U";
  const hasLocation = data.currentLocation?.city || data.currentLocation?.district || data.currentLocation?.address;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between">
      <Header />

      <main className="flex-grow py-10 px-4">
        {editMode ? (
          <div className="flex justify-center">
            <EditProfilePage data={data} onSave={handleSave} onCancel={handleCancel} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">

            {/* ── HERO CARD ── */}
            <div className="relative bg-[#141414] border border-white/8 rounded-2xl overflow-hidden shadow-2xl">

              {/* Banner gradient */}
              <div className="h-40 bg-gradient-to-r from-[#e50914] via-[#c0392b] to-[#ffc83b] relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
                {/* Edit button - top right of banner */}
                <button
                  onClick={() => setEditMode(true)}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white font-semibold px-4 py-2 rounded-xl border border-white/20 transition-all duration-200 text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chỉnh sửa
                </button>
              </div>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                {/* Avatar row */}
                <div className="flex items-end justify-between -mt-14 mb-4">
                  <div className="relative z-10 w-28 h-28 rounded-full overflow-hidden border-4 border-[#141414] shadow-2xl ring-2 ring-white/10">
                    {data.profileCard?.avatarUrl ? (
                      <img src={data.profileCard.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e50914] to-[#ffc83b] flex items-center justify-center text-white text-4xl font-black">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* CineMeet status badge - top right of content */}
                  <div className="mb-2">
                    {data.profileCard?.cineMeetEnabled ? (
                      <span className="inline-flex items-center gap-1.5 bg-[#e50914]/15 text-[#ff5560] border border-[#e50914]/30 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5560] animate-pulse" />
                        🎬 CineMeet Bật
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-white/5 text-slate-500 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        CineMeet Tắt
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & badges */}
                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    {data.profileCard?.displayName || "Chưa đặt tên"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {data.profileCard?.age > 0 && (
                      <span className="inline-flex items-center gap-1 bg-[#ffc83b]/10 text-[#ffc83b] border border-[#ffc83b]/20 px-3 py-1 rounded-full text-xs font-bold">
                        🎂 {data.profileCard.age} tuổi
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 bg-white/5 text-slate-400 border border-white/8 px-3 py-1 rounded-full text-xs font-semibold">
                      🎟️ Thành viên
                    </span>
                    {hasLocation && (
                      <span className="inline-flex items-center gap-1 bg-white/5 text-slate-400 border border-white/8 px-3 py-1 rounded-full text-xs font-semibold">
                        📍 {[data.currentLocation?.district, data.currentLocation?.city].filter(Boolean).join(", ") || "Đã cài địa chỉ"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {data.profileCard?.bio ? (
                  <div className="bg-white/[0.03] border border-white/8 rounded-xl px-5 py-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giới thiệu</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{data.profileCard.bio}</p>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditMode(true)}
                    className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl px-5 py-4 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all group"
                  >
                    <p className="text-slate-600 text-sm group-hover:text-slate-400 transition-colors flex items-center gap-2">
                      <span>✏️</span> Chưa có giới thiệu — Nhấn để thêm bio
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── CINEMEET STATUS CARD ── */}
            <div className={`relative rounded-2xl border overflow-hidden transition-all ${
              data.profileCard?.cineMeetEnabled
                ? "bg-gradient-to-r from-[#e50914]/10 to-[#ffc83b]/5 border-[#e50914]/25"
                : "bg-[#141414] border-white/8"
            }`}>
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    data.profileCard?.cineMeetEnabled
                      ? "bg-[#e50914]/20 ring-1 ring-[#e50914]/40"
                      : "bg-white/5"
                  }`}>
                    🎬
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Tính năng CineMeet</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {data.profileCard?.cineMeetEnabled
                        ? "Đang hoạt động — Hệ thống có thể ghép bạn với người cùng sở thích phim"
                        : "Đang tắt — Bật lên để kết nối với người xem phim gần bạn"}
                    </p>
                  </div>
                </div>

                <div className={`flex-shrink-0 w-12 h-6 rounded-full relative transition-colors duration-300 ${
                  data.profileCard?.cineMeetEnabled ? "bg-[#e50914]" : "bg-white/10"
                }`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
                    data.profileCard?.cineMeetEnabled ? "translate-x-7" : "translate-x-1"
                  }`} />
                </div>
              </div>

              {data.profileCard?.cineMeetEnabled && (
                <div className="px-6 pb-4 flex gap-6">
                  <div className="text-center">
                    <div className="text-lg font-black text-[#ffc83b]">✓</div>
                    <div className="text-[10px] text-slate-500">Hiển thị</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-[#e50914]">❤</div>
                    <div className="text-[10px] text-slate-500">Ghép nối</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-slate-300">💬</div>
                    <div className="text-[10px] text-slate-500">Trò chuyện</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── LOCATION CARD ── */}
            <div className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ffc83b]/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ffc83b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="font-bold text-white text-sm tracking-wide">Địa chỉ liên hệ</h2>
              </div>

              <div className="p-6">
                {hasLocation ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { label: "Số nhà, đường", value: data.currentLocation?.address },
                      { label: "Phường / Xã", value: data.currentLocation?.ward },
                      { label: "Quận / Huyện", value: data.currentLocation?.district },
                      { label: "Thành phố", value: data.currentLocation?.city },
                      { label: "Quốc gia", value: data.currentLocation?.country },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#1a1a1a] rounded-xl p-3.5 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-sm font-semibold text-white truncate">{value || <span className="text-slate-600 font-normal">Chưa có</span>}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => setEditMode(true)}
                    className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl px-5 py-6 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all text-center group"
                  >
                    <p className="text-2xl mb-2">📍</p>
                    <p className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
                      Chưa có địa chỉ — Nhấn để thêm
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Edit button bottom ── */}
            <div className="flex justify-end">
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
        )}
      </main>

      <Footer />
    </div>
  );
}
