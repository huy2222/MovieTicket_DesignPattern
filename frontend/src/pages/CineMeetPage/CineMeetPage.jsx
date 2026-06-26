import { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {
  blockMatch,
  closeMatch,
  discoverProfiles,
  getMatches,
  swipeLeft,
  swipeRight,
  syncCurrentLocation,
} from "../../services/cinemeetService";
import DiscoverSection from "./components/DiscoverSection";
import HistorySection from "./components/HistorySection";
import MatchSection from "./components/MatchSection";
import "./CineMeetPage.css";

export default function CineMeetPage() {
  const [discoverList, setDiscoverList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeHistoryTab, setActiveHistoryTab] = useState("all");
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("Đang lấy vị trí...");
  const [popup, setPopup] = useState(null);

  const visibleActivities = useMemo(() => {
    if (activeHistoryTab === "all") {
      return activities;
    }
    return activities.filter((activity) => activity.type === activeHistoryTab);
  }, [activities, activeHistoryTab]);

  const fetchDiscover = async () => {
    setLoadingDiscover(true);
    try {
      const { data } = await discoverProfiles();
      setDiscoverList(data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được danh sách đề xuất CineMeet.");
    } finally {
      setLoadingDiscover(false);
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const { data } = await getMatches();
      setMatches(data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được danh sách match.");
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await syncCurrentLocation();
        setLocationStatus("Đã cập nhật vị trí hiện tại");
      } catch {
        setLocationStatus("Dùng vị trí mặc định CGV Vincom Thủ Đức");
      } finally {
        fetchDiscover();
        fetchMatches();
      }
    };
    bootstrap();
  }, []);

  const pushActivity = (profile, type) => {
    setActivities((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        name: profile.name ?? "Unknown",
        avatar: profile.avatar ?? null,
        type,
        relativeTime: "Vừa xong",
      },
      ...prev,
    ]);
  };

  const handleUseCurrentLocation = async () => {
    setLocationStatus("Đang lấy vị trí...");
    try {
      await syncCurrentLocation();
      setLocationStatus("Đã cập nhật vị trí hiện tại");
      fetchDiscover();
    } catch {
      setLocationStatus("Không lấy được GPS, đã dùng vị trí mặc định");
      fetchDiscover();
    }
  };

  const handleSwipeLeft = async (profile) => {
    if (!profile) return;
    try {
      await swipeLeft(profile.customerId);
      setDiscoverList((prev) => prev.filter((it) => it.customerId !== profile.customerId));
      pushActivity(profile, "skip");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể thực hiện swipe left.");
    }
  };

  const handleSwipeRight = async (profile) => {
    if (!profile) return;
    try {
      const { data } = await swipeRight(profile.customerId);
      setDiscoverList((prev) => prev.filter((it) => it.customerId !== profile.customerId));
      pushActivity(profile, data?.matched ? "match" : "like");
      if (data?.matched) {
        setPopup({
          matchId: data.matchId,
          conversationId: data.conversationId,
          message: data.message ?? "It's a Match!",
          name: profile.name,
        });
        fetchMatches();
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể thực hiện swipe right.");
    }
  };

  const handleBlockMatch = async (matchId) => {
    try {
      await blockMatch(matchId);
      fetchMatches();
      fetchDiscover();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể block match.");
    }
  };

  const handleCloseMatch = async (matchId) => {
    try {
      await closeMatch(matchId);
      fetchMatches();
      fetchDiscover();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể close match.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <Header />
      <main className="container space-y-5 py-6">
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <DiscoverSection
          profiles={discoverList}
          loading={loadingDiscover}
          locationStatus={locationStatus}
          onUseCurrentLocation={handleUseCurrentLocation}
          onSkip={handleSwipeLeft}
          onLike={handleSwipeRight}
        />

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <HistorySection
            activeTab={activeHistoryTab}
            onTabChange={setActiveHistoryTab}
            activities={visibleActivities}
          />
          <MatchSection
            matches={matches}
            loading={loadingMatches}
            onCloseMatch={handleCloseMatch}
            onBlockMatch={handleBlockMatch}
          />
        </section>
      </main>

      {popup ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#171717] p-5">
            <h3 className="text-2xl font-bold text-white">It&apos;s a Match!</h3>
            <p className="mt-2 text-sm text-[#b3b3b3]">Bạn và {popup.name} đã quan tâm lẫn nhau.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPopup(null)}
                className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-2 text-sm text-white transition hover:bg-[#333]"
              >
                Tiếp tục tìm kiếm
              </button>
              <button
                onClick={() => setPopup(null)}
                className="rounded-lg border border-[#e50914] bg-[#e50914] px-3 py-2 text-sm text-white transition hover:bg-[#ff1a26]"
              >
                Chat ngay
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
