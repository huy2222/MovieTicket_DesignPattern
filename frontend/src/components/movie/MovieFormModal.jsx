import { useState, useEffect } from "react";
import {
  createAdminMovie,
  updateAdminMovie,
  getAdminMovieById,
} from "../../services/movieAdminService";
import { getGenres } from "../../services/genreService";
import TagInput from "../common/TagInput";
import MultiSelect from "../common/MultiSelect";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  getPosterUrl,
  getYoutubeEmbedUrl,
  getAdminDisplayStatus,
} from "../../utils/movieUtils";
import {
  COUNTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  AGE_RATING_OPTIONS,
  STATUS_OPTIONS,
} from "../../constants/movieFormConstants";
import "./MovieFormModal.css";

const INITIAL_FORM = {
  title: "",
  englishTitle: "",
  description: "",
  posterUrl: "",
  bannerUrl: "",
  trailerUrl: "",
  duration: "",
  releaseDate: "",
  country: "",
  language: "",
  genreIds: [],
  directorNames: [],
  actorNames: [],
  ageRestriction: "",
  status: "COMING_SOON",
};

const YOUTUBE_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/i;

export default function MovieFormModal({ movie, onClose, onSuccess }) {
  const isEditing = !!movie;
  const [form, setForm] = useState(INITIAL_FORM);
  const [genreOptions, setGenreOptions] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const res = await getGenres();
        setGenreOptions(res.data || []);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          submit: getApiErrorMessage(err, "Không thể tải danh sách thể loại"),
        }));
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!movie?.id) return;

    const fetchMovieDetail = async () => {
      try {
        setLoadingMovie(true);
        const res = await getAdminMovieById(movie.id);
        const data = res.data;
        setForm({
          title: data.title || "",
          englishTitle: data.englishTitle || "",
          description: data.description || "",
          posterUrl: data.posterUrl || "",
          bannerUrl: data.bannerUrl || "",
          trailerUrl: data.trailerUrl || "",
          duration: data.duration ?? "",
          releaseDate: data.releaseDate || "",
          country: data.country || "",
          language: data.language || "",
          genreIds: data.genreIds || [],
          directorNames: data.directorNames || [],
          actorNames: data.actorNames || [],
          ageRestriction: data.ageRestriction || "",
          status: getAdminDisplayStatus(data.status),
        });
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          submit: getApiErrorMessage(err, "Không thể tải thông tin phim"),
        }));
      } finally {
        setLoadingMovie(false);
      }
    };

    fetchMovieDetail();
  }, [movie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null, submit: null }));
    }
  };

  const handleClearTrailer = () => {
    setForm((prev) => ({ ...prev, trailerUrl: "" }));
  };

  const validate = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = "Tên phim không được để trống";
    if (!form.posterUrl.trim()) errs.posterUrl = "Poster URL không được để trống";
    if (!form.genreIds || form.genreIds.length === 0) {
      errs.genreIds = "Vui lòng chọn ít nhất một thể loại";
    }
    if (!form.duration || Number(form.duration) <= 0) {
      errs.duration = "Thời lượng phải lớn hơn 0";
    }
    if (!form.releaseDate) errs.releaseDate = "Ngày khởi chiếu không được để trống";
    if (!form.status) errs.status = "Vui lòng chọn trạng thái";
    if (
      form.trailerUrl.trim() &&
      !YOUTUBE_PATTERN.test(form.trailerUrl.trim())
    ) {
      errs.trailerUrl = "Trailer URL không hợp lệ. Vui lòng dùng link Youtube";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      englishTitle: form.englishTitle.trim() || null,
      description: form.description.trim() || null,
      posterUrl: form.posterUrl.trim(),
      bannerUrl: form.bannerUrl.trim() || null,
      trailerUrl: form.trailerUrl.trim() || null,
      duration: Number(form.duration),
      releaseDate: form.releaseDate,
      country: form.country || null,
      language: form.language || null,
      genreIds: form.genreIds,
      directorNames: form.directorNames,
      actorNames: form.actorNames,
      ageRestriction: form.ageRestriction || null,
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await updateAdminMovie(movie.id, payload);
        onSuccess("Cập nhật phim thành công!");
      } else {
        await createAdminMovie(payload);
        onSuccess("Thêm phim mới thành công!");
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: getApiErrorMessage(err, "Không thể lưu phim"),
      }));
    } finally {
      setSaving(false);
    }
  };

  const posterPreview = getPosterUrl(form.posterUrl);
  const trailerEmbed = getYoutubeEmbedUrl(form.trailerUrl);
  const isLoading = loadingGenres || loadingMovie;

  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movie-modal-header">
          <h2>{isEditing ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
          <button type="button" className="movie-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="movie-modal-loading">
            <div className="movie-loading-spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <form className="movie-modal-form" onSubmit={handleSubmit}>
            <div className="movie-form-grid">
              <div className="movie-form-main">
                <p className="form-section-title">Thông tin cơ bản</p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="title">
                      Tên phim *
                    </label>
                    <input
                      id="title"
                      name="title"
                      className={`form-input ${errors.title ? "error" : ""}`}
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Nhập tên phim"
                    />
                    {errors.title && (
                      <span className="form-error">{errors.title}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="englishTitle">
                      Tên tiếng Anh
                    </label>
                    <input
                      id="englishTitle"
                      name="englishTitle"
                      className="form-input"
                      value={form.englishTitle}
                      onChange={handleChange}
                      placeholder="English title"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input form-textarea"
                    rows={4}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Mô tả nội dung phim..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="posterUrl">
                    Poster URL *
                  </label>
                  <input
                    id="posterUrl"
                    name="posterUrl"
                    className={`form-input ${errors.posterUrl ? "error" : ""}`}
                    value={form.posterUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  {errors.posterUrl && (
                    <span className="form-error">{errors.posterUrl}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="bannerUrl">
                    Banner URL
                  </label>
                  <input
                    id="bannerUrl"
                    name="bannerUrl"
                    className="form-input"
                    value={form.bannerUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="trailerUrl">
                    Trailer Youtube URL
                  </label>
                  <div className="trailer-input-row">
                    <input
                      id="trailerUrl"
                      name="trailerUrl"
                      className={`form-input ${errors.trailerUrl ? "error" : ""}`}
                      value={form.trailerUrl}
                      onChange={handleChange}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {form.trailerUrl && (
                      <button
                        type="button"
                        className="btn-clear-trailer"
                        onClick={handleClearTrailer}
                      >
                        Xóa trailer
                      </button>
                    )}
                  </div>
                  {errors.trailerUrl && (
                    <span className="form-error">{errors.trailerUrl}</span>
                  )}
                </div>

                <p className="form-section-title">Thông tin khác</p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="duration">
                      Thời lượng (phút) *
                    </label>
                    <input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      className={`form-input ${errors.duration ? "error" : ""}`}
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="120"
                    />
                    {errors.duration && (
                      <span className="form-error">{errors.duration}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="releaseDate">
                      Ngày khởi chiếu *
                    </label>
                    <input
                      id="releaseDate"
                      name="releaseDate"
                      type="date"
                      className={`form-input ${errors.releaseDate ? "error" : ""}`}
                      value={form.releaseDate}
                      onChange={handleChange}
                    />
                    {errors.releaseDate && (
                      <span className="form-error">{errors.releaseDate}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="country">
                      Quốc gia
                    </label>
                    <select
                      id="country"
                      name="country"
                      className="form-input"
                      value={form.country}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn quốc gia --</option>
                      {COUNTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="language">
                      Ngôn ngữ
                    </label>
                    <select
                      id="language"
                      name="language"
                      className="form-input"
                      value={form.language}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn ngôn ngữ --</option>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <MultiSelect
                  label="Thể loại *"
                  options={genreOptions}
                  value={form.genreIds}
                  onChange={(genreIds) => {
                    setForm((prev) => ({ ...prev, genreIds }));
                    if (errors.genreIds) {
                      setErrors((prev) => ({ ...prev, genreIds: null }));
                    }
                  }}
                  placeholder="Chọn thể loại từ danh sách"
                  error={errors.genreIds}
                />

                <TagInput
                  label="Đạo diễn"
                  tags={form.directorNames}
                  onChange={(directorNames) =>
                    setForm((prev) => ({ ...prev, directorNames }))
                  }
                  placeholder="Nhập tên đạo diễn, nhấn Enter"
                />

                <TagInput
                  label="Diễn viên"
                  tags={form.actorNames}
                  onChange={(actorNames) =>
                    setForm((prev) => ({ ...prev, actorNames }))
                  }
                  placeholder="Nhập tên diễn viên, nhấn Enter"
                />

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="ageRestriction">
                      Phân loại độ tuổi
                    </label>
                    <select
                      id="ageRestriction"
                      name="ageRestriction"
                      className="form-input"
                      value={form.ageRestriction}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn độ tuổi --</option>
                      {AGE_RATING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">
                      Trạng thái *
                    </label>
                    <select
                      id="status"
                      name="status"
                      className={`form-input ${errors.status ? "error" : ""}`}
                      value={form.status}
                      onChange={handleChange}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <span className="form-error">{errors.status}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="movie-form-preview">
                <div className="preview-section">
                  <h3>Xem trước Poster</h3>
                  <div className="poster-preview-wrap">
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="poster-preview-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getPosterUrl("");
                      }}
                    />
                  </div>
                </div>

                <div className="preview-section">
                  <h3>Xem trước Trailer</h3>
                  {trailerEmbed ? (
                    <div className="trailer-preview-wrap">
                      <iframe
                        src={trailerEmbed}
                        title="Trailer preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : form.trailerUrl.trim() ? (
                    <p className="preview-hint preview-hint-error">
                      URL trailer không hợp lệ. Vui lòng dùng link Youtube.
                    </p>
                  ) : (
                    <p className="preview-hint">Chưa có trailer</p>
                  )}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="form-submit-error">{errors.submit}</div>
            )}

            <div className="movie-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Hủy
              </button>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm phim"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
