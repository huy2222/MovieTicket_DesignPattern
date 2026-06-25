export default function ProfileCard({ profile, onSkip, onLike }) {
  const genres = (profile.favoriteGenres ?? []).slice(0, 3).join(" • ") || "Chưa có dữ liệu";
  const cinema = (profile.frequentCinemas ?? [])[0] || "Chưa có dữ liệu";

  return (
    <article className="w-[280px] md:w-[300px] shrink-0 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(0,0,0,0.5)]">
      <div className="relative h-[200px] overflow-hidden rounded-t-2xl bg-[#242424]">
        {profile.avatar ? (
          <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-bold text-white/70">
            {(profile.name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
          {profile.distanceKm ?? 0} km
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="text-lg font-semibold text-white">
          {profile.name}, {profile.age ?? "N/A"}
        </div>
        {profile.bio ? <div className="line-clamp-2 text-sm text-[#d0d0d0]">{profile.bio}</div> : null}
        <div className="text-sm text-[#b3b3b3]">📍 {profile.distanceKm ?? 0} km</div>
        <div className="line-clamp-1 text-sm text-[#b3b3b3]">🎬 {genres}</div>
        <div className="line-clamp-1 text-sm text-[#b3b3b3]">🏢 {cinema}</div>
        <div className="pt-1 text-sm font-semibold text-[#ffc107]">
          Điểm tương thích: {Math.round(profile.compatibilityScore ?? 0)}%
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-2 text-sm font-medium text-white transition hover:border-[#4a4a4a] hover:bg-[#343434]"
          >
            ❌ Skip
          </button>
          <button
            type="button"
            onClick={onLike}
            className="rounded-xl border border-[#e50914] bg-[#e50914] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#ff1b28]"
          >
            ❤️ Interested
          </button>
        </div>
      </div>
    </article>
  );
}
