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
export const getLikedProfiles = () => api.get("/cinemeet/likes");
export const blockMatch = (matchId) => api.post(`/cinemeet/matches/${matchId}/block`);
export const closeMatch = (matchId) => api.post(`/cinemeet/matches/${matchId}/close`);
export const getMatchMessages = (matchId, beforeId, limit = 50) =>
  api.get(`/cinemeet/matches/${matchId}/messages`, { params: { beforeId, limit } });
export const sendMatchMessage = (matchId, content) =>
  api.post(`/cinemeet/matches/${matchId}/messages`, { content });
export const getCineMeetShowtimes = () => api.get("/cinemeet/showtimes");
export const getMatchInvitations = (matchId) =>
  api.get(`/cinemeet/matches/${matchId}/invitations`);
export const createMovieInvitation = (matchId, showtimeId) =>
  api.post(`/cinemeet/matches/${matchId}/invitations`, { showtimeId });
export const acceptMovieInvitation = (matchId, invitationId) =>
  api.post(`/cinemeet/matches/${matchId}/invitations/${invitationId}/accept`);
export const rejectMovieInvitation = (matchId, invitationId) =>
  api.post(`/cinemeet/matches/${matchId}/invitations/${invitationId}/reject`);
export const cancelMovieInvitation = (matchId, invitationId) =>
  api.post(`/cinemeet/matches/${matchId}/invitations/${invitationId}/cancel`);
export const getMyCineMeetGroups = () => api.get("/cinemeet/groups");
export const getCineMeetGroupForMatch = (matchId) =>
  api.get(`/cinemeet/matches/${matchId}/group`);
export const selectGroupSeat = (groupId, seatId) =>
  api.post(`/cinemeet/groups/${groupId}/seat`, { seatId });
export const updateGroupPayment = (groupId, status) =>
  api.post(`/cinemeet/groups/${groupId}/payment`, { status });
export const cancelCineMeetGroup = (groupId) =>
  api.post(`/cinemeet/groups/${groupId}/cancel`);
