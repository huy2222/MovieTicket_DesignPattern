import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

import { getNowShowing, getComingSoon } from "../../services/movieService.js";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import MovieCarousel from "../../components/movie/MovieCarousel";

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nowRes, soonRes] = await Promise.all([
          getNowShowing(),
          getComingSoon(),
        ]);
        setNowShowing(nowRes.data ?? []);
        setComingSoon(soonRes.data ?? []);
      } catch (err) {
        console.error("Failed to load movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page cinema-home">
      <Header />

      <section className="cinema-hero">
        <div className="cinema-hero-overlay" />
        <div className="container position-relative">
          <div className="cinema-hero-content">
            <span className="cinema-hero-tag">Chào mừng đến CINEMAX</span>
            <h1 className="cinema-hero-title">
              Trải nghiệm điện ảnh
              <span className="text-gold"> đỉnh cao</span>
            </h1>
            <p className="cinema-hero-desc">
              Khám phá những bộ phim bom tấn đang chiếu và sắp ra mắt tại hệ
              thống rạp CINEMAX.
            </p>
          </div>
        </div>
      </section>

      <main className="container cinema-main">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : (
          <>
            <MovieCarousel
              title="Phim đang chiếu"
              movies={nowShowing}
              emptyMessage="Hiện chưa có phim đang chiếu."
            />

            <MovieCarousel
              title="Phim sắp chiếu"
              movies={comingSoon}
              emptyMessage="Chưa có phim sắp chiếu."
            />
          </>
        )}
      </main>

      <section className="cinema-promo">
        <div className="container text-center">
          <h2 className="promo-title">Đặt vé ngay hôm nay</h2>
          <p className="promo-desc">
            Chọn phim yêu thích và trải nghiệm không gian rạp chiếu hiện đại.
          </p>
          <Link to="/login" className="btn btn-cinema btn-lg">
            Đăng nhập để đặt vé
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
