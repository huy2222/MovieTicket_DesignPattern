export const DEFAULT_POSTER =
  "https://via.placeholder.com/300x450/1a1a1a/e50914?text=No+Poster";

export const MOVIE_STATUS_LABELS = {
  NOW_SHOWING: "Now Showing",
  COMING_SOON: "Coming Soon",
  ENDED: "Ended",
};

export const MOVIE_STATUS_CLASS = {
  NOW_SHOWING: "now-showing",
  COMING_SOON: "coming-soon",
  ENDED: "ended",
};

export const AGE_RATING_LABELS = {
  P: "P - Phổ thông",
  K: "K - Dưới 13 tuổi",
  T13: "T13 - Trên 13 tuổi",
  T16: "T16 - Trên 16 tuổi",
  T18: "T18 - Trên 18 tuổi",
  C: "C - Cấm chiếu",
};

export function formatDuration(minutes) {
  if (!minutes) return "—";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} giờ`;
  return `${hours}h ${mins}m`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

export function getPosterUrl(posterUrl) {
  return posterUrl && posterUrl.trim() ? posterUrl.trim() : DEFAULT_POSTER;
}

export function getAdminDisplayStatus(status) {
  if (status === "COMING_SOON") return "COMING_SOON";
  if (status === "ENDED" || status === "STOPPED") return "ENDED";
  return "NOW_SHOWING";
}

export function getAgeRatingLabel(value) {
  if (!value) return "—";
  return AGE_RATING_LABELS[value] || value;
}
