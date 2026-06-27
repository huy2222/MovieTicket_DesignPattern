import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { getProfile, updateProfile } from "../../services/customerService";
import {
  blockMatch,
  closeMatch,
  discoverProfiles,
  getLikedProfiles,
  getMatches,
  swipeLeft,
  swipeRight,
  syncCurrentLocation,
} from "../../services/cinemeetService";
import DiscoverSection from "./components/DiscoverSection";
import HistorySection from "./components/HistorySection";
import MatchSection from "./components/MatchSection";
import ChatPanel from "./components/ChatPanel";
import "./CineMeetPage.css";

const DISCOVER_REFILL_THRESHOLD = 2;
const formatLikedAt = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Đã thích trước đó";

export default function CineMeetPage() {
  const [profileData, setProfileData] = useState(null);
  const [cineMeetEnabled, setCineMeetEnabled] = useState(true);
  const [savingCineMeet, setSavingCineMeet] = useState(false);
  const [discoverList, setDiscoverList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("Đang lấy vị trí...");
  const [popup, setPopup] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [discoverExhausted, setDiscoverExhausted] = useState(false);
  const discoverFetchInFlightRef = useRef(false);

  const buildProfilePayload = (data, enabled) => ({
    profileCard: {
      displayName: data?.profileCard?.displayName ?? "",
      age: data?.profileCard?.age ?? 0,
      bio: data?.profileCard?.bio ?? "",
      cineMeetEnabled: enabled,
    },
    currentLocation: {
      address: data?.currentLocation?.address ?? "",
      ward: data?.currentLocation?.ward ?? "",
      district: data?.currentLocation?.district ?? "",
      city: data?.currentLocation?.city ?? "",
      country: data?.currentLocation?.country ?? "Vietnam",
    },
  });

  const fetchDiscover = useCallback(async ({ append = false, silent = false } = {}) => {
    if (discoverFetchInFlightRef.current) {
      return [];
    }

    discoverFetchInFlightRef.current = true;
    if (!silent) {
      setLoadingDiscover(true);
    }
    try {
      const { data } = await discoverProfiles();
      const incoming = data ?? [];

      setDiscoverList((prev) => {
        if (!append) {
          return incoming;
        }

        const knownIds = new Set(prev.map((profile) => profile.customerId));
        const newProfiles = incoming.filter((profile) => !knownIds.has(profile.customerId));
        return [...prev, ...newProfiles];
      });
      setDiscoverExhausted(incoming.length === 0);
      return incoming;
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được danh sách đề xuất CineMeet.");
      return [];
    } finally {
      discoverFetchInFlightRef.current = false;
      if (!silent) {
        setLoadingDiscover(false);
      }
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const { data } = await getMatches();
      setMatches(data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không tải được danh sách match.");
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  const fetchLikes = useCallback(async () => {
    try {
      const { data } = await getLikedProfiles();
      setActivities((data ?? []).map((profile) => ({
        id: `like-${profile.customerId}`,
        customerId: profile.customerId,
        name: profile.name ?? "Người dùng",
        avatar: profile.avatar ?? null,
        type: "like",
        relativeTime: formatLikedAt(profile.likedAt),
      })));
    } catch (err) {
      if (err?.response?.status === 404) {
        setActivities([]);
        return;
      }
      setError(err?.response?.data?.message ?? "Không tải được danh sách đã thích.");
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      let enabled = true;

      try {
        const { data } = await getProfile();
        enabled = data?.profileCard?.cineMeetEnabled ?? false;
        setProfileData(data);
        setCineMeetEnabled(enabled);
      } catch (err) {
        setError(err?.response?.data?.message ?? "Không tải được thông tin CineMeet.");
      }

      if (!enabled) {
        setLoadingDiscover(false);
        setLoadingMatches(false);
        return;
      }

      try {
        await syncCurrentLocation();
        setLocationStatus("Đã cập nhật vị trí hiện tại");
      } catch {
        setLocationStatus("Dùng vị trí mặc định CGV Vincom Thủ Đức");
      } finally {
        setDiscoverExhausted(false);
        fetchDiscover();
        fetchMatches();
        fetchLikes();
      }
    };
    bootstrap();
  }, [fetchDiscover, fetchLikes, fetchMatches]);

  useEffect(() => {
    if (!cineMeetEnabled || loadingDiscover || discoverExhausted || discoverFetchInFlightRef.current) {
      return;
    }

    if (discoverList.length <= DISCOVER_REFILL_THRESHOLD) {
      fetchDiscover({ append: true, silent: true });
    }
  }, [cineMeetEnabled, discoverList.length, discoverExhausted, fetchDiscover, loadingDiscover]);

  const refreshCineMeetData = async () => {
    setDiscoverExhausted(false);
    await syncCurrentLocation();
    setLocationStatus("Đã cập nhật vị trí hiện tại");
    fetchDiscover();
    fetchMatches();
    fetchLikes();
  };

  const handleToggleCineMeet = async () => {
    if (savingCineMeet || !profileData) {
      return;
    }

    const nextEnabled = !cineMeetEnabled;
    const previousEnabled = cineMeetEnabled;
    setSavingCineMeet(true);
    setCineMeetEnabled(nextEnabled);
    setActiveChat(null);
    setPopup(null);

    if (!nextEnabled) {
      setMatches([]);
      setDiscoverList([]);
      setActivities([]);
      setLoadingDiscover(false);
      setLoadingMatches(false);
    }

    try {
      const { data } = await updateProfile(buildProfilePayload(profileData, nextEnabled));
      setProfileData(data);
      if (nextEnabled) {
        await refreshCineMeetData();
      }
    } catch (err) {
      setCineMeetEnabled(previousEnabled);
      setError(err?.response?.data?.message ?? "Không cập nhật được trạng thái CineMeet.");
    } finally {
      setSavingCineMeet(false);
    }
  };

  const pushActivity = (profile, type) => {
    setActivities((prev) => {
      const activity = {
        id: `${Date.now()}-${Math.random()}`,
        customerId: profile.customerId,
        name: profile.name ?? "Unknown",
        avatar: profile.avatar ?? null,
        type,
        relativeTime: "Vừa xong",
      };
      return [
        activity,
        ...prev.filter((item) => item.customerId !== profile.customerId),
      ];
    });
  };

  const handleUseCurrentLocation = async () => {
    setLocationStatus("Đang lấy vị trí...");
    try {
      await syncCurrentLocation();
      setLocationStatus("Đã cập nhật vị trí hiện tại");
      setDiscoverExhausted(false);
      fetchDiscover();
    } catch {
      setLocationStatus("Không lấy được GPS, đã dùng vị trí mặc định");
      setDiscoverExhausted(false);
      fetchDiscover();
    }
  };

  const handleSwipeLeft = async (profile) => {
    if (!profile || !cineMeetEnabled) return;
    try {
      await swipeLeft(profile.customerId);
      setDiscoverList((prev) => {
        const remainingProfiles = prev.filter((it) => it.customerId !== profile.customerId);
        return [...remainingProfiles, profile];
      });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể bỏ qua hồ sơ này.");
    }
  };

  const handleSwipeRight = async (profile) => {
    if (!profile || !cineMeetEnabled) return;
    try {
      const { data } = await swipeRight(profile.customerId);
      setDiscoverList((prev) => prev.filter((it) => it.customerId !== profile.customerId));
      pushActivity(profile, "like");
      if (data?.matched) {
        setPopup({
          matchId: data.matchId,
          conversationId: data.conversationId,
          message: data.message ?? "It's a Match!",
          name: profile.name,
          favoriteGenres: profile.favoriteGenres ?? [],
        });
        fetchMatches();
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể thích hồ sơ này.");
    }
  };

  const handleBlockMatch = async (matchId) => {
    try {
      await blockMatch(matchId);
      fetchMatches();
      setDiscoverExhausted(false);
      fetchDiscover();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể chặn match.");
    }
  };

  const handleCloseMatch = async (matchId) => {
    try {
      await closeMatch(matchId);
      fetchMatches();
      setDiscoverExhausted(false);
      fetchDiscover();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể đóng match.");
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

        <section className={`cinemeet-toggle-card ${cineMeetEnabled ? "is-enabled" : "is-disabled"}`}>
          <div className="flex min-w-0 items-center gap-4">
            <div className="cinemeet-toggle-icon">CM</div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">CineMeet</h1>
              <p className="mt-1 text-sm text-[#b3b3b3]">
                {cineMeetEnabled
                  ? "Đang hoạt động, hệ thống có thể ghép bạn với người cùng sở thích phim."
                  : "Đang tắt, bật lên để mở lại khám phá và match của bạn."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleCineMeet}
            disabled={savingCineMeet || !profileData}
            aria-pressed={cineMeetEnabled}
            className={`cinemeet-switch ${cineMeetEnabled ? "is-on" : "is-off"}`}
          >
            <span />
          </button>
        </section>

        <div className={`cinemeet-stage ${cineMeetEnabled ? "curtain-open" : "curtain-closed"}`}>
          <div className="cinemeet-curtain" aria-hidden="true" />
          {!cineMeetEnabled ? (
            <div className="cinemeet-curtain-message">
              <h2>CineMeet đang tắt</h2>
              <p>Bật công tắc phía trên để kéo rèm mở lại phần khám phá và match.</p>
            </div>
          ) : null}

          <section className="cinemeet-layout">
            <DiscoverSection
              profiles={discoverList}
              loading={loadingDiscover}
              locationStatus={locationStatus}
              onUseCurrentLocation={handleUseCurrentLocation}
              onSkip={handleSwipeLeft}
              onLike={handleSwipeRight}
            />

            <HistorySection
              activities={activities}
            />

            <MatchSection
              matches={matches}
              loading={loadingMatches}
              disabled={!cineMeetEnabled}
              onCloseMatch={handleCloseMatch}
              onBlockMatch={handleBlockMatch}
              onOpenChat={setActiveChat}
            />
          </section>
        </div>
      </main>

      {popup ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#171717] p-5">
            <h3 className="text-2xl font-bold text-white">It's a Match!</h3>
            <p className="mt-2 text-sm text-[#b3b3b3]">Bạn và {popup.name} đã quan tâm lẫn nhau.</p>
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-[#8f8f8f]">Thể loại phim {popup.name} yêu thích</p>
              {popup.favoriteGenres?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {popup.favoriteGenres.map((genre) => (
                    <span
                      key={`popup-genre-${genre}`}
                      className="rounded-full border border-[#444] bg-[#252525] px-2 py-1 text-xs text-[#d6d6d6]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777]">Chưa cập nhật</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPopup(null)}
                className="rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-2 text-sm text-white transition hover:bg-[#333]"
              >
                Tiếp tục tìm kiếm
              </button>
              <button
                onClick={() => {
                  const matched = matches.find((match) => match.matchId === popup.matchId);
                  setActiveChat(matched ?? {
                    matchId: popup.matchId,
                    conversationId: popup.conversationId,
                    peer: { name: popup.name },
                  });
                  setPopup(null);
                }}
                className="rounded-lg border border-[#e50914] bg-[#e50914] px-3 py-2 text-sm text-white transition hover:bg-[#ff1a26]"
              >
                Chat ngay
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeChat && cineMeetEnabled ? <ChatPanel match={activeChat} onClose={() => setActiveChat(null)} /> : null}

      <Footer />
    </div>
  );
}
