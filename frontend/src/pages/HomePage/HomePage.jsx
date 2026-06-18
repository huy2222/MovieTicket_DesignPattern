import { useEffect, useState } from "react";
import "./HomePage.css";

import {
  getFeaturedMovie,
  getNowShowing,
  getComingSoon,
} from "../../services/movieService.js";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import FeaturedHero from "../../components/movie/FeaturedHero";
import MovieCard from "../../components/movie/MovieCard";
import ComingSoonCard from "../../components/movie/ComingSoonCard";
import MovieModal from "../../components/movie/MovieModal";

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [f, n, c] = await Promise.all([
        getFeaturedMovie(),
        getNowShowing(),
        getComingSoon(),
      ]);

      setFeatured(f.data);
      setNowShowing(n.data);
      setComingSoon(c.data);
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      <Header />

      <main>
        {featured && <FeaturedHero movie={featured} onBook={setSelectedMovie} />}

        <section className="movie-section">
          <h2>Now Showing</h2>
          <div className="movie-grid">
            {nowShowing && nowShowing.length > 0 ? (
              nowShowing.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={setSelectedMovie}
                />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                No movies available
              </p>
            )}
          </div>
        </section>

        <section className="movie-section">
          <h2>Coming Soon</h2>
          <div className="movie-grid">
            {comingSoon && comingSoon.length > 0 ? (
              comingSoon.map((movie) => (
                <ComingSoonCard
                  key={movie.id}
                  movie={movie}
                  onClick={setSelectedMovie}
                />
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                No upcoming movies
              </p>
            )}
          </div>
        </section>
      </main>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      <Footer />
    </div>
  );
}
