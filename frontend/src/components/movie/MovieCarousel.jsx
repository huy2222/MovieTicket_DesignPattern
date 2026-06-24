import { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  formatDate,
  formatDuration,
  getPosterUrl,
} from "../../utils/movieUtils";
import "./MovieCarousel.css";

function MovieCarouselCard({ movie }) {
  return (
    <article className="carousel-movie-card">
      <div className="carousel-poster-wrap">
        <img
          src={getPosterUrl(movie.posterUrl)}
          alt={movie.title}
          className="carousel-poster"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="carousel-poster-overlay" />
        {movie.ageRestriction && (
          <span className="carousel-age-badge">{movie.ageRestriction}</span>
        )}
      </div>

      <div className="carousel-card-body">
        <h3 className="carousel-movie-title" title={movie.title}>
          {movie.title}
        </h3>
        <ul className="carousel-meta list-unstyled mb-3">
          <li>
            <i className="bi bi-clock me-1" />
            {formatDuration(movie.duration)}
          </li>
          <li>
            <i className="bi bi-calendar-event me-1" />
            {formatDate(movie.releaseDate)}
          </li>
        </ul>
        <Link
          to={`/movies/${movie.id}`}
          className="btn btn-cinema btn-sm w-100"
        >
          Chi tiết
        </Link>
      </div>
    </article>
  );
}

export default function MovieCarousel({ title, movies = [], emptyMessage }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const scrollByAmount = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.max(track.clientWidth * 0.75, 280);
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const onMouseDown = useCallback((e) => {
    const track = trackRef.current;
    if (!track) return;
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX - track.offsetLeft,
      scrollLeft: track.scrollLeft,
    };
    track.classList.add("is-dragging");
  }, []);

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;
      const x = e.pageX - track.offsetLeft;
      const walk = x - dragState.current.startX;
      track.scrollLeft = dragState.current.scrollLeft - walk;
    },
    [isDragging]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    trackRef.current?.classList.remove("is-dragging");
  }, []);

  if (!movies.length) {
    return (
      <section className="movie-carousel-section">
        <h2 className="carousel-section-title">{title}</h2>
        <p className="carousel-empty text-muted">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="movie-carousel-section">
      <div className="carousel-header d-flex align-items-center justify-content-between mb-4">
        <h2 className="carousel-section-title mb-0">{title}</h2>
        <div className="carousel-nav d-none d-md-flex gap-2">
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => scrollByAmount(-1)}
            aria-label="Cuộn trái"
          >
            <i className="bi bi-chevron-left" />
          </button>
          <button
            type="button"
            className="carousel-nav-btn"
            onClick={() => scrollByAmount(1)}
            aria-label="Cuộn phải"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>
      </div>

      <div className="carousel-wrapper position-relative">
        <button
          type="button"
          className="carousel-nav-btn carousel-nav-floating carousel-nav-left d-md-none"
          onClick={() => scrollByAmount(-1)}
          aria-label="Cuộn trái"
        >
          <i className="bi bi-chevron-left" />
        </button>

        <div
          ref={trackRef}
          className="carousel-track"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          {movies.map((movie) => (
            <MovieCarouselCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          type="button"
          className="carousel-nav-btn carousel-nav-floating carousel-nav-right d-md-none"
          onClick={() => scrollByAmount(1)}
          aria-label="Cuộn phải"
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </section>
  );
}
