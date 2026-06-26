import './MovieCard.css'
import { useNavigate } from 'react-router-dom';

export default function MovieCard({ movie, onClick }) {
  const navigate = useNavigate();

  const handleBookTicket = (e) => {
    e.stopPropagation();
    navigate(`/booking/${movie.id}`);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    if (onClick) onClick(movie);
    else navigate(`/movies/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={handleDetails}>
      <div className="movie-image">
        <img src={movie.image} alt={movie.title} />
        <div className="movie-overlay">
          <button className="btn btn-primary" onClick={handleBookTicket}>
            🎟️ MUA VÉ
          </button>
          <button className="btn btn-secondary" onClick={handleDetails}>
            ℹ️ XEM CHI TIẾT
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h4>{movie.title}</h4>
        <p>{movie.genre}</p>
        <div className="movie-rating">
          <span>★ {movie.rating_value}</span>
          <span>{movie.rating}</span>
        </div>
      </div>
    </div>
  );
}