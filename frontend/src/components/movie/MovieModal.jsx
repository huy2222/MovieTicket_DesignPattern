import './MovieModal.css'

export default function MovieModal({ movie, onClose }) {
  if (!movie) return null;

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
        <button className="btn btn-primary">
          {movie.releaseDate ? "Notify Me" : "Book Now"}
        </button>
      </div>
    </div>
  );
}