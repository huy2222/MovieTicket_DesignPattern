import ProfileCard from "./ProfileCard";

export default function DiscoverSection({ profiles, loading, locationStatus, onUseCurrentLocation, onSkip, onLike }) {
  const activeProfile = profiles[0];

  return (
    <section className="cinemeet-panel cinemeet-discover-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">CineMeet Discover</h1>
          <p className="text-sm text-[#b3b3b3]">Kết nối người có cùng gu xem phim</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-2 text-sm text-white transition hover:bg-[#333]"
          >
            Cập nhật vị trí hiện tại
          </button>
          <span className="text-xs text-[#8a8a8a]">{locationStatus}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center pb-2">
          <div className="h-[410px] w-full max-w-[360px] animate-pulse rounded-2xl bg-[#222]" />
        </div>
      ) : !activeProfile ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-6 text-sm text-[#b3b3b3]">
          Hiện chưa có hồ sơ phù hợp lân cận.
        </div>
      ) : (
        <div className="flex justify-center pb-2">
          <ProfileCard
            key={activeProfile.customerId}
            profile={activeProfile}
            onSkip={() => onSkip(activeProfile)}
            onLike={() => onLike(activeProfile)}
          />
        </div>
      )}
    </section>
  );
}
