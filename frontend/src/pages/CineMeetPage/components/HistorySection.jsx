const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "like", label: "Đã thích" },
  { key: "skip", label: "Đã bỏ qua" },
  { key: "match", label: "Đã match" },
];

const badgeClasses = {
  like: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  skip: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  match: "bg-red-500/15 text-red-400 border-red-500/30",
};

const labelByType = {
  like: "Đã thích",
  skip: "Đã bỏ qua",
  match: "Đã match",
};

export default function HistorySection({ activeTab, onTabChange, activities }) {
  return (
    <section className="cinemeet-panel cinemeet-history-card">
      <h2 className="text-base font-semibold text-white">Lịch sử hoạt động</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              activeTab === tab.key
                ? "border-[#e50914] bg-[#e50914]/15 text-[#ff6b74]"
                : "border-[#2f2f2f] bg-[#151515] text-[#b3b3b3] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
              <span className={`ml-2 flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClasses[item.type]}`}>
                {labelByType[item.type]}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
