export default function MatchSection({ matches, loading, disabled, onCloseMatch, onBlockMatch, onOpenChat }) {
  return (
    <section className="cinemeet-panel cinemeet-match-card">
      <h2 className="text-xl font-semibold text-white">Match của bạn</h2>

      <div className="mt-4 space-y-3">
        {disabled ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Bật CineMeet để xem các match của bạn.
          </div>
        ) : loading ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Đang tải match...
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Bạn chưa có Match ACTIVE nào.
          </div>
        ) : (
          matches.map((match) => {
            const favoriteGenres = match.favoriteGenres ?? match.peer?.favoriteGenres ?? [];

            return (
            <div key={match.matchId} className="rounded-xl border border-[#2a2a2a] bg-[#131313] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-[#2a2a2a]">
                    {match.peer?.avatar ? (
                      <img src={match.peer.avatar} alt={match.peer.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{match.peer?.name}</div>
                    <div className="text-xs text-[#b3b3b3]">
                      {`"${(favoriteGenres[0] && `Hẹn xem phim ${favoriteGenres[0]} nhé!`) || "Hẹn xem phim cuối tuần nhé!"}"`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChat(match)}
                  className="rounded-lg border border-[#e50914]/60 px-3 py-1.5 text-xs font-medium text-[#ff6b74] transition hover:bg-[#e50914]/15"
                >
                  Chat
                </button>
              </div>

              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-medium text-[#8f8f8f]">Thể loại phim yêu thích</p>
                {favoriteGenres.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {favoriteGenres.map((genre) => (
                      <span
                        key={`${match.matchId}-${genre}`}
                        className="rounded-full border border-[#444] bg-[#252525] px-2 py-1 text-[11px] text-[#d6d6d6]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#777]">Chưa cập nhật</p>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onCloseMatch(match.matchId)}
                  className="rounded-lg border border-[#3a3a3a] bg-[#252525] px-3 py-1.5 text-xs text-white hover:bg-[#303030]"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => onBlockMatch(match.matchId)}
                  className="rounded-lg border border-[#e50914]/60 bg-[#321417] px-3 py-1.5 text-xs text-[#ff7d85] hover:bg-[#3e1a1f]"
                >
                  Chặn
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
    </section>
  );
}
