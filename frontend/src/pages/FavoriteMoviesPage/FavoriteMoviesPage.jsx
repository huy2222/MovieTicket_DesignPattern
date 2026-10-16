import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import favoriteService from "../../services/favoriteService";
import {
  DEFAULT_POSTER,
  formatDate,
  formatDuration,
  getPosterUrl,
} from "../../utils/movieUtils";
import "./FavoriteMoviesPage.css";

export default function FavoriteMoviesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách phim yêu thích. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (movieId, movieTitle) => {
    if (deletingId) return;
    setDeletingId(movieId);
    try {
      await favoriteService.removeFavorite(movieId);
      setFavorites((prev) => prev.filter((item) => item.id !== movieId));
      setToastMessage({
        type: "success",
        text: `Đã xóa "${movieTitle}" khỏi danh sách yêu thích.`,
      });
    } catch (err) {
      setToastMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Xóa phim khỏi danh sách yêu thích thất bại.",
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="favorites-page">
      <Header />

      <main className="favorites-container">
        <div className="favorites-header">
          <div className="favorites-title-group">
            <h1>
              <span className="heart-icon">❤️</span> Phim Yêu Thích Của Tôi
            </h1>
            <p className="favorites-subtitle">
              Lưu giữ những tác phẩm điện ảnh bạn yêu thích để dễ dàng theo dõi và đặt vé.
            </p>
          </div>

          {!loading && favorites.length > 0 && (
            <div className="favorites-count-badge">
              {favorites.length} bộ phim đã lưu
            </div>
          )}
        </div>

        {toastMessage && (
          <div className={`favorites-alert ${toastMessage.type}`}>
            <span>{toastMessage.text}</span>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setToastMessage(null)}
              aria-label="Close"
            />
          </div>
        )}

        {error && (
          <div className="favorites-alert error">
            <span>{error}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline-light ms-3"
              onClick={fetchFavorites}
            >
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="favorites-loading">
            <div className="favorites-spinner" />
            <p>Đang tải danh sách phim yêu thích...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="empty-icon-wrap">💔</div>
            <h2>Danh sách yêu thích đang trống.</h2>
            <p>
              Bạn chưa lưu bộ phim nào vào danh sách yêu thích. Hãy khám phá ngay các
              bộ phim đang chiếu và sắp chiếu để thêm vào danh sách của bạn!
            </p>
            <Link to="/movies" className="btn-explore">
              🎬 Khám phá phim ngay
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((movie) => {
              const genresText = movie.genres?.length
                ? movie.genres.join(", ")
                : movie.genre || null;

              return (
                <div key={movie.id} className="fav-card">
                  <div className="fav-poster-wrapper">
                    <img
                      src={getPosterUrl(movie.posterUrl)}
                      alt={movie.title}
                      className="fav-poster"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_POSTER;
                      }}
                    />

                    {movie.status === "NOW_SHOWING" && (
                      <span className="fav-status-badge now">Đang chiếu</span>
                    )}
                    {movie.status === "COMING_SOON" && (
                      <span className="fav-status-badge soon">Sắp chiếu</span>
                    )}

                    <button
                      type="button"
                      className="fav-remove-btn"
                      title="Xóa khỏi yêu thích"
                      disabled={deletingId === movie.id}
                      onClick={() => handleRemoveFavorite(movie.id, movie.title)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>

                  <div className="fav-info">
                    <h3 className="fav-title">
                      <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                    </h3>

                    <div className="fav-meta">
                      {movie.duration ? (
                        <span className="fav-meta-item">
                          <i className="bi bi-clock" /> {formatDuration(movie.duration)}
                        </span>
                      ) : null}
                      {genresText ? (
                        <span className="fav-meta-item">
                          <i className="bi bi-tag" /> {genresText}
                        </span>
                      ) : null}
                      {movie.releaseDate ? (
                        <span className="fav-meta-item">
                          <i className="bi bi-calendar" /> {formatDate(movie.releaseDate)}
                        </span>
                      ) : null}
                    </div>

                    <div className="fav-card-actions">
                      <Link
                        to={`/movies/${movie.id}`}
                        className="btn-detail"
                      >
                        Chi tiết & Đặt vé
                      </Link>
                      <button
                        type="button"
                        className="btn-delete-text"
                        disabled={deletingId === movie.id}
                        onClick={() => handleRemoveFavorite(movie.id, movie.title)}
                      >
                        {deletingId === movie.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
