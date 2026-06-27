import { useState, useEffect, useCallback } from "react";
import {
  getAdminMovies,
  updateAdminMovieStatus,
  deleteAdminMovie,
} from "../../../services/movieAdminService";
import { getGenres } from "../../../services/genreService";
import MovieFormModal from "../../../components/movie/MovieFormModal";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
  DEFAULT_POSTER,
  MOVIE_STATUS_LABELS,
  MOVIE_STATUS_CLASS,
  formatDuration,
  formatDate,
  getPosterUrl,
  getAdminDisplayStatus,
  getAgeRatingLabel,
} from "../../../utils/movieUtils";
import "./MovieManagementPage.css";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "NOW_SHOWING", label: "Now Showing" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "ENDED", label: "Ended" },
];

const PAGE_SIZE = 10;

const ADMIN_SORT_OPTIONS = [
  { value: "releaseDate_desc", label: "Ngày KC: Mới nhất" },
  { value: "releaseDate_asc", label: "Ngày KC: Cũ nhất" },
  { value: "title_asc", label: "Tên phim: A - Z" },
  { value: "title_desc", label: "Tên phim: Z - A" },
];

export default function MovieManagementPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("releaseDate_desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Advanced Search States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allGenres, setAllGenres] = useState([]);
  const [filterId, setFilterId] = useState("");
  const [filterDirector, setFilterDirector] = useState("");
  const [filterActor, setFilterActor] = useState("");
  const [filterGenreIds, setFilterGenreIds] = useState([]);
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterCreatedFrom, setFilterCreatedFrom] = useState("");
  const [filterCreatedTo, setFilterCreatedTo] = useState("");
  const [filterReleaseFrom, setFilterReleaseFrom] = useState("");
  const [filterReleaseTo, setFilterReleaseTo] = useState("");

  useEffect(() => {
    getGenres()
      .then((res) => setAllGenres(res.data || []))
      .catch((err) => console.error("Lỗi tải thể loại:", err));
  }, []);

  const handleResetAdvanced = () => {
    setFilterId("");
    setFilterDirector("");
    setFilterActor("");
    setFilterGenreIds([]);
    setFilterCreatedBy("");
    setFilterCreatedFrom("");
    setFilterCreatedTo("");
    setFilterReleaseFrom("");
    setFilterReleaseTo("");
    setPage(0);
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const [sortField, sortDir] = sortBy.split("_");
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy: sortField,
        sortDirection: sortDir,
      };
      if (search.trim()) params.keyword = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      if (showAdvanced) {
        if (filterId.trim()) params.id = filterId.trim();
        if (filterDirector.trim()) params.director = filterDirector.trim();
        if (filterActor.trim()) params.actor = filterActor.trim();
        if (filterGenreIds.length > 0) params.genreIds = filterGenreIds;
        if (filterCreatedBy.trim()) params.createdBy = filterCreatedBy.trim();
        if (filterCreatedFrom) params.createdFrom = filterCreatedFrom + "T00:00:00";
        if (filterCreatedTo) params.createdTo = filterCreatedTo + "T23:59:59";
        if (filterReleaseFrom) params.releaseFrom = filterReleaseFrom;
        if (filterReleaseTo) params.releaseTo = filterReleaseTo;
      }

      const res = await getAdminMovies(params);
      setMovies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error("Lỗi tải danh sách phim:", err);
      showToast("Không thể tải danh sách phim", "error");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    statusFilter,
    sortBy,
    showAdvanced,
    filterId,
    filterDirector,
    filterActor,
    filterGenreIds,
    filterCreatedBy,
    filterCreatedFrom,
    filterCreatedTo,
    filterReleaseFrom,
    filterReleaseTo,
    showToast
  ]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleCreate = () => {
    setEditingMovie(null);
    setModalOpen(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingMovie(null);
  };

  const handleModalSuccess = (message) => {
    handleModalClose();
    showToast(message);
    fetchMovies();
  };

  const handleStatusChange = async (movie, newStatus) => {
    if (getAdminDisplayStatus(movie.status) === newStatus) return;

    try {
      setStatusUpdatingId(movie.id);
      await updateAdminMovieStatus(movie.id, newStatus);
      showToast("Cập nhật trạng thái thành công!");
      fetchMovies();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể cập nhật trạng thái"), "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async (movie) => {
    const confirmMessage = movie.hasRelatedData
      ? `Phim "${movie.title}" đã có dữ liệu liên quan. Hệ thống sẽ chuyển sang trạng thái NGỪNG CHIẾU thay vì xóa. Bạn có chắc chắn?`
      : `Bạn chắc chắn muốn xóa phim "${movie.title}"? Hành động này không thể hoàn tác.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await deleteAdminMovie(movie.id);
      const data = res.data;
      showToast(data.message || "Thao tác thành công!");
      fetchMovies();
    } catch (err) {
      showToast(getApiErrorMessage(err, "Không thể thực hiện thao tác"), "error");
    }
  };

  return (
    <div className="movie-management-page">
      {toast && (
        <div className={`movie-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="movie-page-header">
        <h1 className="movie-page-title">
          <span className="movie-page-title-icon">🎬</span>
          Quản lý Phim
          <span className="movie-count-badge">{totalElements} phim</span>
        </h1>
        <button className="btn-create-movie" onClick={handleCreate}>
          <span>＋</span> Thêm phim
        </button>
      </div>

      <div className="movie-toolbar">
        <form className="movie-search" onSubmit={handleSearchSubmit}>
          <span className="movie-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên phim..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn-search">
            Tìm
          </button>
        </form>

        <select
          className="movie-filter-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="movie-filter-select"
          value={sortBy}
          onChange={handleSortChange}
        >
          {ADMIN_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Search Accordion */}
      <div className="advanced-search-container">
        <button
          type="button"
          className={`btn-toggle-advanced ${showAdvanced ? "active" : ""}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "⚙️ Ẩn bộ lọc nâng cao" : "⚙️ Tìm kiếm nâng cao"}
        </button>

        {showAdvanced && (
          <div className="advanced-search-grid">
            <div className="adv-filter-group">
              <label>ID Phim</label>
              <input
                type="number"
                placeholder="ID..."
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
              />
            </div>
            <div className="adv-filter-group">
              <label>Đạo diễn</label>
              <input
                type="text"
                placeholder="Tên đạo diễn..."
                value={filterDirector}
                onChange={(e) => setFilterDirector(e.target.value)}
              />
            </div>
            <div className="adv-filter-group">
              <label>Diễn viên</label>
              <input
                type="text"
                placeholder="Tên diễn viên..."
                value={filterActor}
                onChange={(e) => setFilterActor(e.target.value)}
              />
            </div>
            <div className="adv-filter-group">
              <label>Người tạo</label>
              <input
                type="text"
                placeholder="Email..."
                value={filterCreatedBy}
                onChange={(e) => setFilterCreatedBy(e.target.value)}
              />
            </div>

            <div className="adv-filter-group double-width">
              <label>Ngày khởi chiếu</label>
              <div className="adv-range-inputs">
                <input
                  type="date"
                  value={filterReleaseFrom}
                  onChange={(e) => setFilterReleaseFrom(e.target.value)}
                />
                <span>đến</span>
                <input
                  type="date"
                  value={filterReleaseTo}
                  onChange={(e) => setFilterReleaseTo(e.target.value)}
                />
              </div>
            </div>

            <div className="adv-filter-group double-width">
              <label>Ngày tạo phim</label>
              <div className="adv-range-inputs">
                <input
                  type="date"
                  value={filterCreatedFrom}
                  onChange={(e) => setFilterCreatedFrom(e.target.value)}
                />
                <span>đến</span>
                <input
                  type="date"
                  value={filterCreatedTo}
                  onChange={(e) => setFilterCreatedTo(e.target.value)}
                />
              </div>
            </div>

            <div className="adv-filter-group full-width">
              <label>Thể loại</label>
              <div className="adv-genres-list">
                {allGenres.map((g) => (
                  <label key={g.id} className="adv-genre-item">
                    <input
                      type="checkbox"
                      checked={filterGenreIds.includes(g.id)}
                      onChange={() => {
                        setFilterGenreIds((prev) =>
                          prev.includes(g.id)
                            ? prev.filter((id) => id !== g.id)
                            : [...prev, g.id]
                        );
                      }}
                    />
                    <span>{g.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="adv-actions-row">
              <button type="button" className="btn-adv-reset" onClick={handleResetAdvanced}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="movie-loading">
          <div className="movie-loading-spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="movie-empty">
          <div className="movie-empty-icon">🎬</div>
          <h3>Chưa có phim nào</h3>
          <p>
            {search || statusFilter !== "ALL"
              ? "Không tìm thấy phim phù hợp với bộ lọc."
              : 'Nhấn "Thêm phim" để bắt đầu.'}
          </p>
        </div>
      ) : (
        <>
          <div className="movie-table-wrapper">
            <table className="movie-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Tên phim</th>
                  <th>Thể loại</th>
                  <th>Thời lượng</th>
                  <th>Ngày khởi chiếu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id}>
                    <td>
                      <img
                        src={getPosterUrl(movie.posterUrl)}
                        alt={movie.title}
                        className="movie-table-poster"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_POSTER;
                        }}
                      />
                    </td>
                    <td>
                      <strong>{movie.title}</strong>
                      {movie.ageRestriction && (
                        <div className="movie-age-badge">
                          {getAgeRatingLabel(movie.ageRestriction)}
                        </div>
                      )}
                    </td>
                    <td>
                      {movie.genres?.length > 0
                        ? movie.genres.join(", ")
                        : "—"}
                    </td>
                    <td>{formatDuration(movie.duration)}</td>
                    <td>{formatDate(movie.releaseDate)}</td>
                    <td>
                      <select
                        className={`movie-status-select ${
                          MOVIE_STATUS_CLASS[movie.status] || ""
                        }`}
                        value={getAdminDisplayStatus(movie.status)}
                        disabled={statusUpdatingId === movie.id}
                        onChange={(e) =>
                          handleStatusChange(movie, e.target.value)
                        }
                      >
                        <option value="NOW_SHOWING">Now Showing</option>
                        <option value="COMING_SOON">Coming Soon</option>
                        <option value="ENDED">Ended</option>
                      </select>
                    </td>
                    <td>
                      <div className="movie-actions">
                        <button
                          className="btn-action edit"
                          onClick={() => handleEdit(movie)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(movie)}
                          title={
                            movie.hasRelatedData
                              ? "Ngừng chiếu"
                              : "Xóa phim"
                          }
                        >
                          {movie.hasRelatedData ? "⏹ Ngưng" : "🗑️ Xóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="movie-pagination">
              <button
                className="btn-page"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Trước
              </button>
              <span className="page-info">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                className="btn-page"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <MovieFormModal
          movie={editingMovie}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
