export default function HistorySection({ activities }) {
  return (
    <section className="cinemeet-panel cinemeet-history-card">
      <h2 className="text-base font-semibold text-white">Đã thích</h2>

      <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1 cinemeet-scroll">
        {activities.length === 0 ? (
          <div className="rounded-xl border border-[#2a2a2a] bg-[#121212] p-4 text-sm text-[#b3b3b3]">
            Chưa có hoạt động nào.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#131313] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-[#2a2a2a]">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{item.name}</div>
                  <div className="text-xs text-[#b3b3b3]">{item.relativeTime}</div>
                </div>
              </div>
              <span className="ml-2 flex-shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Đã thích
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
