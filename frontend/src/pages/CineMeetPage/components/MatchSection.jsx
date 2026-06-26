export default function MatchSection({ matches, loading, onCloseMatch, onBlockMatch }) {
  return (
    <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 md:p-5">
      <h2 className="text-xl font-semibold text-white">Match của bạn</h2>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Đang tải match...
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Bạn chưa có Match ACTIVE nào.
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.matchId} className="rounded-xl border border-[#2a2a2a] bg-[#131313] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full bg-[#2a2a2a]">
                    {match.peer?.avatar ? (
                      <img src={match.peer.avatar} alt={match.peer.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="font-medium text-white">{match.peer?.name}</div>
                    <div className="text-xs text-[#b3b3b3]">
                      {`"${(match.favoriteGenres?.[0] && `Hẹn xem phim ${match.favoriteGenres[0]} nhé!`) || "Hẹn xem phim cuối tuần nhé!"}"`}
                    </div>
                    <div className="mt-1 text-[11px] text-[#8f8f8f]">Match ID: {match.matchId}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-[#e50914]/60 px-3 py-1.5 text-xs font-medium text-[#ff6b74] transition hover:bg-[#e50914]/15"
                >
                  Chat
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onCloseMatch(match.matchId)}
                  className="rounded-lg border border-[#3a3a3a] bg-[#252525] px-3 py-1.5 text-xs text-white hover:bg-[#303030]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onBlockMatch(match.matchId)}
                  className="rounded-lg border border-[#e50914]/60 bg-[#321417] px-3 py-1.5 text-xs text-[#ff7d85] hover:bg-[#3e1a1f]"
                >
                  Block
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
