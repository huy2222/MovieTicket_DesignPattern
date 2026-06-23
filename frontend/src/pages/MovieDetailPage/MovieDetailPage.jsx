import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {
  formatDate,
  formatDuration,
  getPosterUrl,
  getYoutubeAutoplayEmbedUrl,
  getYoutubeThumbnailUrl,
  getYoutubeVideoId,
  getAgeRatingLabel,
  MOVIE_STATUS_LABELS,
} from "../../utils/movieUtils";
import "./MovieDetailPage.css";

const STATUS_VI = {
  NOW_SHOWING: "Đang chiếu",
  COMING_SOON: "Sắp chiếu",
  ENDED: "Đã kết thúc",
};

function SectionHeading({ children }) {
  return (
    <div className="detail-section-heading">
      <h2 className="detail-section-title">{children}</h2>
      <span className="detail-section-line" />
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value || value === "—") return null;
  return (
    <div className="detail-info-row">
      <i className={`bi ${icon} detail-info-icon`} />
      <div className="detail-info-text">
        <span className="detail-info-label">{label}</span>
        <span className="detail-info-value">{value}</span>
      </div>
    </div>
  );
}

function DetailGridItem({ icon, label, value }) {
  return (
    <div className="detail-grid-item">
      <div className="detail-grid-icon-wrap">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <span className="detail-grid-label">{label}</span>
        <p className="detail-grid-value">{value || "—"}</p>
      </div>
    </div>
  );
}

function TrailerModal({ embedUrl, title, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      className="trailer-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer ${title}`}
    >
      <div
        className="trailer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="trailer-modal-close"
          onClick={onClose}
          aria-label="Đóng trailer"
        >
          <i className="bi bi-x-lg" />
        </button>
        <div className="ratio ratio-16x9 trailer-modal-iframe-wrap">
          <iframe
            src={embedUrl}
            title={`Trailer ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const closeTrailer = useCallback(() => setTrailerOpen(false), []);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMovieById(id);
        setMovie(res.data);
        setThumbError(false);
      } catch {
        setError("Không tìm thấy phim hoặc đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="movie-detail-page">
        <Header />
        <div className="detail-loading">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-page">
        <Header />
        <div className="detail-loading">
          <p className="text-muted mb-4">{error}</p>
          <Link to="/" className="btn btn-cinema">
            Về trang chủ
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const bannerUrl = movie.bannerUrl || movie.posterUrl;
  const videoId = getYoutubeVideoId(movie.trailerUrl);
  const thumbnailUrl = videoId ? getYoutubeThumbnailUrl(movie.trailerUrl) : null;
  const autoplayEmbedUrl = getYoutubeAutoplayEmbedUrl(movie.trailerUrl);
  const hasYoutubeTrailer = Boolean(videoId && thumbnailUrl);

  const statusClass =
    movie.status === "NOW_SHOWING"
      ? "status-now"
      : movie.status === "COMING_SOON"
        ? "status-soon"
        : "status-ended";

  const statusLabel =
    STATUS_VI[movie.status] || MOVIE_STATUS_LABELS[movie.status];

  const genresText = movie.genres?.length ? movie.genres.join(", ") : null;
  const directorsText = movie.directorNames?.length
    ? movie.directorNames.join(", ")
    : null;
  const actorsText = movie.actorNames?.length
    ? movie.actorNames.join(", ")
    : null;

  const handleThumbError = () => {
    if (videoId && !thumbError) {
      setThumbError(true);
    }
  };

  const effectiveThumb =
    thumbError && videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : thumbnailUrl;

  return (
    <div className="movie-detail-page">
      <Header />

      {/* Hero: banner + poster + info */}
      <section
        className="detail-hero"
        style={{ backgroundImage: `url(${getPosterUrl(bannerUrl)})` }}
      >
        <div className="detail-hero-overlay" />
        <div className="container detail-hero-inner">
          <nav aria-label="breadcrumb" className="detail-breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Trang chủ</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {movie.title}
              </li>
            </ol>
          </nav>

          <div className="row g-4 g-lg-5 align-items-end detail-hero-row">
            <div className="col-md-4 col-lg-3">
              <div className="detail-poster-card">
                <img
                  src={getPosterUrl(movie.posterUrl)}
                  alt={movie.title}
                  className="detail-poster-img"
                />
              </div>
            </div>

            <div className="col-md-8 col-lg-9">
              <div className="detail-hero-info">
                <div className="detail-hero-badges">
                  <span className={`detail-status-badge ${statusClass}`}>
                    {statusLabel}
                  </span>
                  {movie.ageRestriction && (
                    <span className="detail-age-badge">
                      {movie.ageRestriction}
                    </span>
                  )}
                </div>

                <h1 className="detail-title">{movie.title}</h1>
                {movie.englishTitle && (
                  <p className="detail-english-title">{movie.englishTitle}</p>
                )}

                <div className="detail-quick-meta">
                  {movie.ageRestriction && (
                    <span className="quick-meta-chip">
                      <i className="bi bi-shield-check" />
                      {getAgeRatingLabel(movie.ageRestriction)}
                    </span>
                  )}
                  <span className="quick-meta-chip">
                    <i className="bi bi-clock" />
                    {formatDuration(movie.duration)}
                  </span>
                  <span className="quick-meta-chip">
                    <i className="bi bi-calendar-event" />
                    {formatDate(movie.releaseDate)}
                  </span>
                  <span className={`quick-meta-chip quick-meta-status ${statusClass}`}>
                    <i className="bi bi-film" />
                    {statusLabel}
                  </span>
                </div>

                <div className="detail-info-list">
                  <InfoRow
                    icon="bi-camera-reels"
                    label="Đạo diễn"
                    value={directorsText}
                  />
                  <InfoRow
                    icon="bi-people"
                    label="Diễn viên"
                    value={actorsText}
                  />
                  <InfoRow
                    icon="bi-geo-alt"
                    label="Quốc gia"
                    value={movie.country}
                  />
                  <InfoRow
                    icon="bi-translate"
                    label="Ngôn ngữ"
                    value={movie.language}
                  />
                  <InfoRow
                    icon="bi-tags"
                    label="Thể loại"
                    value={genresText}
                  />
                  <InfoRow
                    icon="bi-star"
                    label="Phân loại"
                    value={
                      movie.ageRestriction
                        ? getAgeRatingLabel(movie.ageRestriction)
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container detail-body">
        {/* Nội dung phim */}
        <section className="detail-card">
          <SectionHeading>NỘI DUNG PHIM</SectionHeading>
          <p className="detail-description">
            {movie.description || "Chưa có nội dung mô tả cho phim này."}
          </p>
        </section>

        {/* Trailer */}
        <section className="detail-card">
          <SectionHeading>TRAILER</SectionHeading>
          {hasYoutubeTrailer ? (
            <button
              type="button"
              className="trailer-thumbnail-btn"
              onClick={() => setTrailerOpen(true)}
              aria-label="Phát trailer"
            >
              <img
                src={effectiveThumb}
                alt={`Thumbnail trailer ${movie.title}`}
                className="trailer-thumbnail-img"
                onError={handleThumbError}
              />
              <div className="trailer-thumbnail-overlay" />
              <div className="trailer-play-btn">
                <i className="bi bi-play-fill" />
              </div>
            </button>
          ) : (
            <div className="trailer-placeholder">
              <div className="trailer-placeholder-icon">
                <i className="bi bi-play-circle" />
              </div>
              <p>Chưa có trailer</p>
            </div>
          )}
        </section>

        {/* Thông tin chi tiết */}
        <section className="detail-card">
          <SectionHeading>THÔNG TIN CHI TIẾT</SectionHeading>
          <div className="detail-info-grid">
            <DetailGridItem
              icon="bi-clock-history"
              label="Thời lượng"
              value={formatDuration(movie.duration)}
            />
            <DetailGridItem
              icon="bi-calendar-check"
              label="Ngày khởi chiếu"
              value={formatDate(movie.releaseDate)}
            />
            <DetailGridItem
              icon="bi-tags-fill"
              label="Thể loại"
              value={genresText}
            />
            <DetailGridItem
              icon="bi-globe2"
              label="Quốc gia"
              value={movie.country}
            />
            <DetailGridItem
              icon="bi-chat-square-text"
              label="Ngôn ngữ"
              value={movie.language}
            />
            <DetailGridItem
              icon="bi-camera-reels-fill"
              label="Đạo diễn"
              value={directorsText}
            />
            <DetailGridItem
              icon="bi-person-video2"
              label="Diễn viên"
              value={actorsText}
            />
            <DetailGridItem
              icon="bi-building"
              label="Nhà sản xuất"
              value="—"
            />
          </div>
        </section>
      </main>

      {trailerOpen && autoplayEmbedUrl && (
        <TrailerModal
          embedUrl={autoplayEmbedUrl}
          title={movie.title}
          onClose={closeTrailer}
        />
      )}

      <Footer />
    </div>
  );
}
