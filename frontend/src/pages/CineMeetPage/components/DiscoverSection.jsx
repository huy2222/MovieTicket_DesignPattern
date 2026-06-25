import ProfileCard from "./ProfileCard";

export default function DiscoverSection({ profiles, loading, locationStatus, onUseCurrentLocation, onSkip, onLike }) {
  return (
    <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 md:p-5">
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
            Use Current Location
          </button>
          <span className="text-xs text-[#8a8a8a]">{locationStatus}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-[410px] w-[280px] shrink-0 animate-pulse rounded-2xl bg-[#222]" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-6 text-sm text-[#b3b3b3]">
          Hiện chưa có hồ sơ phù hợp.
        </div>
      ) : (
        <div className="cinemeet-scroll flex gap-3 overflow-x-auto pb-2">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.customerId}
              profile={profile}
              onSkip={() => onSkip(profile)}
              onLike={() => onLike(profile)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
