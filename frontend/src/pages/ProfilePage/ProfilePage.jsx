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

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-[#0a0a0a] text-white">
        <Header />
        <div className="flex flex-grow items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e50914] border-t-transparent" />
            <span className="text-sm text-slate-400">Đang tải hồ sơ...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = (updatedData) => {
    setData(updatedData);
    setEditMode(false);
  };

  const handleCancel = () => setEditMode(false);

  const initials = data.fullName?.charAt(0).toUpperCase() || "U";
  const hasLocation = data.currentLocation?.city || data.currentLocation?.district || data.currentLocation?.address;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#0a0a0a] text-white">
      <Header />

      <main className="flex-grow px-4 py-10">
        {editMode ? (
          <div className="flex justify-center">
            <EditProfilePage data={data} onSave={handleSave} onCancel={() => setEditMode(false)} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">
              <div className="relative h-40 bg-gradient-to-r from-[#e50914] via-[#c0392b] to-[#ffc83b]">
                <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')]"/>
                <button
                  onClick={() => setEditMode(true)}
                  className="absolute right-4 top-4 flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chỉnh sửa
                </button>
              </div>

              <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="-mt-14 mb-4 flex items-end justify-between">
                  <div className="relative z-10 h-28 w-28 overflow-hidden rounded-full border-4 border-[#141414] shadow-2xl ring-2 ring-white/10">
                    {data.profileCard?.avatarUrl ? (
                      <img src={data.profileCard.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e50914] to-[#ffc83b] text-4xl font-black text-white">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    {data.fullName || "Chưa đặt tên"}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {data.profileCard?.age > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#ffc83b]/20 bg-[#ffc83b]/10 px-3 py-1 text-xs font-bold text-[#ffc83b]">
                        {data.profileCard.age} tuổi
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                      Thành viên
                    </span>
                    {hasLocation ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                        {[data.currentLocation?.district, data.currentLocation?.city].filter(Boolean).join(", ") || "Đã cài địa chỉ"}
                      </span>
                    ) : null}
                  </div>
                </div>

                {data.profileCard?.bio ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Giới thiệu</p>
                    <p className="text-sm leading-relaxed text-slate-300">{data.profileCard.bio}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-4 text-left text-sm text-slate-600 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-400"
                  >
                    Chưa có giới thiệu, nhấn để thêm bio
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-lg">
              <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc83b]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ffc83b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold tracking-wide text-white">Địa chỉ liên hệ</h2>
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
                      <div key={label} className="rounded-xl border border-white/5 bg-[#1a1a1a] p-3.5">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                        <p className="truncate text-sm font-semibold text-white">
                          {value || <span className="font-normal text-slate-600">Chưa có</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-6 text-center text-sm text-slate-500 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-400"
                  >
                    Chưa có địa chỉ, nhấn để thêm
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="rounded-xl bg-gradient-to-r from-[#e50914] to-[#b20710] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:from-[#ff3847] hover:to-[#e50914]"
              >
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
