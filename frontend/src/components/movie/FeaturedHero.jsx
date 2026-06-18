import './FeaturedHero.css'

export default function FeaturedHero({ movie, onBook }) {
  return (
    <section className="featured-hero">
      <div
        className="featured-image"
        style={{ backgroundImage: `url(${movie.image})` }}
      />
      <div className="featured-overlay" />
      <div className="featured-content">
        <h2>{movie.title}</h2>
        <p>{movie.description}</p>
        <div className="featured-metadata">
          <span>⭐ {movie.rating || 'PG-13'}</span>
          <span>⏱️ {movie.duration || '2h 30m'}</span>
          <span>🎬 {movie.genre}</span>
        </div>
        <button className="btn btn-primary" onClick={() => onBook(movie)}>
          Book Now
        </button>
      </div>
    </section>
  );
}