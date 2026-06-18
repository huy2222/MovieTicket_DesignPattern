import './MovieCard.css'

export default function MovieCard({ movie, onClick }) {
  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="movie-image">
        <img src={movie.image} alt={movie.title} />
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