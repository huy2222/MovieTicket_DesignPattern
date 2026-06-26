import api from "../api/axiosConfig";

const FALLBACK_LOCATION = {
  latitude: 10.8506,
  longitude: 106.7719,
  address: "CGV Vincom Thủ Đức",
  district: "Thủ Đức",
  city: "TP.HCM",
  country: "Vietnam",
};

export const updateCurrentLocation = (payload) => api.post("/cinemeet/location", payload);

export const syncCurrentLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      updateCurrentLocation(FALLBACK_LOCATION).then(resolve).catch(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
          .then(resolve)
          .catch(resolve);
      },
      () => {
        updateCurrentLocation(FALLBACK_LOCATION).then(resolve).catch(resolve);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });

export const discoverProfiles = () => api.get("/cinemeet/discover");
export const swipeLeft = (targetCustomerId) => api.post("/cinemeet/swipe/left", { targetCustomerId });
export const swipeRight = (targetCustomerId) => api.post("/cinemeet/swipe/right", { targetCustomerId });
export const getMatches = () => api.get("/cinemeet/matches");
export const blockMatch = (matchId) => api.post(`/cinemeet/matches/${matchId}/block`);
export const closeMatch = (matchId) => api.post(`/cinemeet/matches/${matchId}/close`);
