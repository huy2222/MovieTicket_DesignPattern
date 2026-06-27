import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { searchMovies } from "../../services/movieService";
import { getGenres } from "../../services/genreService";
import {
  DEFAULT_POSTER,
  formatDuration,
  formatDate,
  getPosterUrl,
  getAgeRatingLabel,
} from "../../utils/movieUtils";
import "./MovieSearchPage.css";

const SORT_OPTIONS = [
  { value: "releaseDate_desc", label: "Ngày chiếu: Mới nhất" },
  { value: "releaseDate_asc", label: "Ngày chiếu: Cũ nhất" },
  { value: "title_asc", label: "Tên phim: A - Z" },
  { value: "title_desc", label: "Tên phim: Z - A" },
  { value: "duration_desc", label: "Thời lượng: Giảm dần" },
  { value: "duration_asc", label: "Thời lượng: Tăng dần" },
  { value: "rating_desc", label: "Đánh giá: Cao nhất" },
];

const AGE_RATING_OPTIONS = [
  { value: "", label: "Tất cả độ tuổi" },
  { value: "P", label: "P - Phổ thông" },
  { value: "K", label: "K - Dưới 13 tuổi" },
  { value: "T13", label: "Trên 13 tuổi" },
  { value: "T16", label: "Trên 16 tuổi" },
  { value: "T18", label: "Trên 18 tuổi" },
  { value: "C", label: "C - Cấm chiếu" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "NOW_SHOWING", label: "Đang chiếu (Now Showing)" },
  { value: "COMING_SOON", label: "Sắp chiếu (Coming Soon)" },
];

export default function MovieSearchPage() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [status, setStatus] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [releaseFrom, setReleaseFrom] = useState("");
  const [releaseTo, setReleaseTo] = useState("");
  const [sortBy, setSortBy] = useState("releaseDate_desc");

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Genres
    getGenres()
      .then((res) => setGenres(res.data || []))
      .catch((err) => console.error("Lỗi tải thể loại:", err));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const buildSearchParams = useCallback(() => {
    const [sortField, sortDir] = sortBy.split("_");
    const params = {
      page,
      size: 12,
      sortBy: sortField,
      sortDirection: sortDir,
    };

    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (selectedGenres.length > 0) params.genreIds = selectedGenres;
    if (status) params.status = status;
    if (ageRating) params.ageRating = ageRating;
    if (language.trim()) params.language = language.trim();
    if (country.trim()) params.country = country.trim();
    if (minDuration) params.minDuration = parseInt(minDuration, 10);
    if (maxDuration) params.maxDuration = parseInt(maxDuration, 10);
    if (releaseFrom) params.releaseFrom = releaseFrom;
    if (releaseTo) params.releaseTo = releaseTo;

    return params;
  }, [
    page,
    sortBy,
    debouncedKeyword,
    selectedGenres,
    status,
    ageRating,
    language,
    country,
    minDuration,
    maxDuration,
    releaseFrom,
    releaseTo,
  ]);

  const fetchMoviesList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchMovies(buildSearchParams());
      setMovies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error("Lỗi tìm kiếm phim:", err);
      setError("Không thể tải danh sách phim. Vui lòng thử lại.");
      setMovies([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams]);

  useEffect(() => {
    fetchMoviesList();
  }, [fetchMoviesList]);

  // Update document title for SEO
  useEffect(() => {
    document.title = "Tìm kiếm phim chiếu rạp | CINEMAX";
  }, []);

  const handleGenreChange = (genreId) => {
    setPage(0);
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleFilterChange = (setter) => (e) => {
    setPage(0);
    setter(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchMoviesList();
  };

  const handleResetFilters = () => {
    setKeyword("");
    setSelectedGenres([]);
    setStatus("");
    setAgeRating("");
    setLanguage("");
    setCountry("");
    setMinDuration("");
    setMaxDuration("");
    setReleaseFrom("");
    setReleaseTo("");
    setPage(0);
  };

  return (
    <div className="movie-search-page-container">
      <Header />

      <main className="search-main-content">
        <div className="search-header-banner">
          <div className="banner-overlay" />
          <div className="container relative z-10 text-center py-10">
            <h1 className="search-title-highlight" id="search-page-heading">
              Khám Phá Phim Chiếu Rạp
            </h1>
            <p className="search-subtitle">
              Tìm kiếm bộ phim yêu thích của bạn theo nhiều tiêu chí lọc nâng cao
            </p>
          </div>
        </div>

        <div className="container search-layout-grid">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar-card">
            <div className="sidebar-header">
              <h2>Bộ lọc tìm kiếm</h2>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={handleResetFilters}
                id="btn-reset-filters"
              >
                Xóa tất cả
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} id="movie-search-form">
              {/* Keyword */}
              <div className="filter-group">
                <label htmlFor="filter-keyword">Từ khóa tìm kiếm</label>
                <input
                  type="text"
                  id="filter-keyword"
                  className="filter-input-text"
                  placeholder="Tên phim, tiếng Anh..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="filter-group">
                <label htmlFor="filter-status">Trạng thái phim</label>
                <select
                  id="filter-status"
                  className="filter-select-input"
                  value={status}
                  onChange={handleFilterChange(setStatus)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Rating */}
              <div className="filter-group">
                <label htmlFor="filter-age-rating">Độ tuổi</label>
                <select
                  id="filter-age-rating"
                  className="filter-select-input"
                  value={ageRating}
                  onChange={handleFilterChange(setAgeRating)}
                >
                  {AGE_RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genres Checklist */}
              <div className="filter-group">
                <label>Thể loại phim</label>
                <div className="genres-checkbox-container">
                  {genres.map((g) => (
                    <label key={g.id} className="checkbox-item-label">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(g.id)}
                        onChange={() => handleGenreChange(g.id)}
                        id={`genre-cb-${g.id}`}
                      />
                      <span>{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language & Country */}
              <div className="filter-row">
                <div className="filter-group half-width">
                  <label htmlFor="filter-lang">Ngôn ngữ</label>
                  <input
                    type="text"
                    id="filter-lang"
                    className="filter-input-text"
                    placeholder="Ví dụ: Tiếng Anh"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
                <div className="filter-group half-width">
                  <label htmlFor="filter-country">Quốc gia</label>
                  <input
                    type="text"
                    id="filter-country"
                    className="filter-input-text"
                    placeholder="Ví dụ: Mỹ"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* Duration Range */}
              <div className="filter-group">
                <label>Thời lượng (phút)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    min="0"
                    placeholder="Từ"
                    className="filter-input-text duration-range-input"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    id="filter-min-duration"
                  />
                  <span className="range-separator">—</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Đến"
                    className="filter-input-text duration-range-input"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    id="filter-max-duration"
                  />
                </div>
              </div>

              {/* Release Date Range */}
              <div className="filter-group">
                <label>Khoảng ngày chiếu</label>
                <div className="date-range-container">
                  <div className="date-input-wrapper">
                    <span>Từ</span>
                    <input
                      type="date"
                      className="filter-input-text"
                      value={releaseFrom}
                      onChange={(e) => setReleaseFrom(e.target.value)}
                      id="filter-release-from"
                    />
                  </div>
                  <div className="date-input-wrapper mt-2">
                    <span>Đến</span>
                    <input
                      type="date"
                      className="filter-input-text"
                      value={releaseTo}
                      onChange={(e) => setReleaseTo(e.target.value)}
                      id="filter-release-to"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-apply-filters"
                id="btn-apply-filters"
              >
                Áp dụng bộ lọc
              </button>
            </form>
          </aside>

          {/* Results List */}
          <section className="search-results-section">
            <div className="results-toolbar-header">
              <div className="total-results-count">
                Tìm thấy <strong>{totalElements}</strong> kết quả
              </div>
              <div className="sort-by-container">
                <label htmlFor="sort-by-select">Sắp xếp:</label>
                <select
                  id="sort-by-select"
                  className="sort-select-input"
                  value={sortBy}
                  onChange={(e) => {
                    setPage(0);
                    setSortBy(e.target.value);
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="search-results-error-banner">{error}</div>
            )}

            {loading ? (
              <div className="search-results-loading">
                <div className="search-spinner" />
                <p>Đang tải dữ liệu phim...</p>
              </div>
            ) : movies.length === 0 ? (
              <div className="search-results-empty">
                <span className="empty-icon">🎬</span>
                <h3>Không tìm thấy phim phù hợp</h3>
                <p>Vui lòng đổi từ khóa hoặc thiết lập lại bộ lọc để tìm kiếm.</p>
                <button
                  type="button"
                  className="btn btn-gold-outline mt-4"
                  onClick={handleResetFilters}
                >
                  Reset bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="search-movies-grid">
                  {movies.map((movie) => (
                    <div key={movie.id} className="movie-card-premium">
                      <div className="movie-card-poster-wrapper">
                        <img
                          src={getPosterUrl(movie.posterUrl)}
                          alt={movie.title}
                          className="movie-card-poster"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_POSTER;
                          }}
                        />
                        <div className="movie-card-hover-overlay">
                          <Link
                            to={`/movies/${movie.id}`}
                            className="btn btn-cinema btn-sm"
                            id={`view-detail-${movie.id}`}
                          >
                            Chi tiết & Đặt vé
                          </Link>
                        </div>
                        {movie.status === "COMING_SOON" && (
                          <div className="movie-badge com-soon">Sắp chiếu</div>
                        )}
                        {movie.status === "NOW_SHOWING" && (
                          <div className="movie-badge now-show">Đang chiếu</div>
                        )}
                        {movie.ageRestriction && (
                          <div className="movie-age-badge-overlay">
                            {movie.ageRestriction}
                          </div>
                        )}
                      </div>

                      <div className="movie-card-info">
                        <h3 className="movie-card-title">
                          <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
                        </h3>
                        {movie.englishTitle && (
                          <p className="movie-card-eng-title">
                            {movie.englishTitle}
                          </p>
                        )}

                        <div className="movie-meta-summary">
                          <span>⏱ {formatDuration(movie.duration)}</span>
                          <span>📅 {formatDate(movie.releaseDate)}</span>
                        </div>

                        {movie.averageRating > 0 && (
                          <div className="movie-card-rating">
                            <span className="rating-star">⭐</span>
                            <span className="rating-value">
                              {movie.averageRating.toFixed(1)}/5
                            </span>
                          </div>
                        )}

                        <div className="movie-card-genres">
                          {movie.genres?.slice(0, 3).map((g, idx) => (
                            <span key={idx} className="genre-tag">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="search-pagination">
                    <button
                      type="button"
                      className="pagination-btn-nav"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      id="btn-prev-page"
                    >
                      ← Trước
                    </button>
                    <span className="pagination-info">
                      Trang <strong>{page + 1}</strong> trên {totalPages}
                    </span>
                    <button
                      type="button"
                      className="pagination-btn-nav"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      id="btn-next-page"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
