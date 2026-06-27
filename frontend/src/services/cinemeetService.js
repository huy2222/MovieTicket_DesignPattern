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
export const getMatchMessages = (matchId, beforeId, limit = 50) =>
  api.get(`/cinemeet/matches/${matchId}/messages`, { params: { beforeId, limit } });
export const sendMatchMessage = (matchId, content) =>
  api.post(`/cinemeet/matches/${matchId}/messages`, { content });
export const getCineMeetShowtimes = () => api.get("/cinemeet/showtimes");
export const getMatchInvitations = (matchId) =>
  api.get(`/cinemeet/matches/${matchId}/movie-dates`);
export const createMovieInvitation = (matchId, showtimeId, movieId) =>
  api.post(`/cinemeet/matches/${matchId}/movie-dates`, { showtimeId, movieId });
export const acceptMovieInvitation = (matchId, invitationId) =>
  api.put(`/cinemeet/matches/${matchId}/movie-dates/${invitationId}/respond?accept=true`);
export const rejectMovieInvitation = (matchId, invitationId) =>
  api.put(`/cinemeet/matches/${matchId}/movie-dates/${invitationId}/respond?accept=false`);
export const cancelMovieInvitation = (matchId, invitationId) =>
  api.put(`/cinemeet/matches/${matchId}/movie-dates/${invitationId}/respond?accept=false`); // Backend treats cancel as reject or can add new endpoint
export const getMyCineMeetGroups = () => api.get("/cinemeet/group-bookings");
export const getCineMeetGroupForMatch = (matchId) =>
  api.get(`/cinemeet/group-bookings/match/${matchId}`); // Assuming we need to add this to backend
export const selectGroupSeat = (groupId, seatId) =>
  api.post(`/cinemeet/group-bookings/${groupId}/seats/${seatId}`);
export const getGroupVNPayUrl = (groupId) =>
  api.post(`/cinemeet/group-bookings/${groupId}/payment/vnpay-url`);
export const cancelCineMeetGroup = (groupId) =>
  api.delete(`/cinemeet/group-bookings/${groupId}`);
