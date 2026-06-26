import './FeaturedHero.css'
import { useNavigate } from 'react-router-dom';

export default function FeaturedHero({ movie }) {
  const navigate = useNavigate();

  const handleBookTicket = () => {
    navigate(`/booking/${movie.id}`);
  };

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
        <button className="btn btn-primary" onClick={handleBookTicket}>
          🎟️ MUA VÉ NGAY
        </button>
      </div>
    </section>
  );
}