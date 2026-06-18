import './ComingSoonCard.css'
import '../movie/MovieCard.css'

export default function ComingSoonCard({ movie, onClick }) {
  return (
    <div className="movie-card coming-soon-card" onClick={() => onClick(movie)}>
      <div className="movie-image">
        <img src={movie.image} alt={movie.title} />
        <div className="coming-soon-badge">
          Coming {movie.releaseDate}
        </div>
      </div>
      <div className="movie-info">
        <h4>{movie.title}</h4>
        <p>{movie.genre}</p>
      </div>
    </div>
  );
}