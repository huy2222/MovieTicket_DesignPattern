import { useState, useEffect, useCallback } from "react";
import {
  getAdminMovies,
  updateAdminMovieStatus,
  deleteAdminMovie,
} from "../../services/movieAdminService";
import MovieFormModal from "../../components/movie/MovieFormModal";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  DEFAULT_POSTER,
  MOVIE_STATUS_LABELS,
  MOVIE_STATUS_CLASS,
  formatDuration,
  formatDate,
  getPosterUrl,
  getAdminDisplayStatus,
  getAgeRatingLabel,
} from "../../utils/movieUtils";
import "./MovieManagementPage.css";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "NOW_SHOWING", label: "Now Showing" },
  { value: "COMING_SOON", label: "Coming Soon" },
  { value: "ENDED", label: "Ended" },
];

const PAGE_SIZE = 10;

export default function MovieManagementPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: PAGE_SIZE,
        sortDirection,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

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
  }, [page, search, statusFilter, sortDirection, showToast]);

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
    setSortDirection(e.target.value);
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
          value={sortDirection}
          onChange={handleSortChange}
        >
          <option value="desc">Ngày KC: Mới nhất</option>
          <option value="asc">Ngày KC: Cũ nhất</option>
        </select>
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
