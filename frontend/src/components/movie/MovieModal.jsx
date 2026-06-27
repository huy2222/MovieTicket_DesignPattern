import './MovieModal.css'
import { useNavigate } from 'react-router-dom';

export default function MovieModal({ movie, onClose }) {
  const navigate = useNavigate();

  if (!movie) return null;

  const handleBookTicket = () => {
    onClose();
    navigate(`/booking/${movie.id}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <img src={movie.image} alt={movie.title} />
        <h2>{movie.title}</h2>
        <p>{movie.description || movie.genre}</p>
        <div className="modal-rating">
          <div className="modal-rating-item">
            <label>Rating</label>
            <value>{movie.rating || 'PG-13'}</value>
          </div>
          <div className="modal-rating-item">
            <label>Duration</label>
            <value>{movie.duration || '2h 30m'}</value>
          </div>
          <div className="modal-rating-item">
            <label>Genre</label>
            <value>{movie.genre}</value>
          </div>
        </div>
        <button className="btn-cinema" style={{padding: '12px 24px', width: '100%', marginTop: '20px'}} onClick={handleBookTicket}>
          {movie.releaseDate ? "SẮP CHIẾU" : "🎟️ ĐẶT VÉ NGAY"}
        </button>
      </div>
    </div>
  );
}