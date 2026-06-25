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
    <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 md:p-5">
      <h2 className="text-xl font-semibold text-white">Lịch sử hoạt động</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              activeTab === tab.key
                ? "border-[#e50914] bg-[#e50914]/15 text-[#ff6b74]"
                : "border-[#2f2f2f] bg-[#151515] text-[#b3b3b3] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
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
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#2a2a2a]">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-xs text-[#b3b3b3]">{item.relativeTime}</div>
                </div>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClasses[item.type]}`}>
                {labelByType[item.type]}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
