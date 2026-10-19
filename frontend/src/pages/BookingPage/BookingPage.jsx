import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getCitiesWithShowtimes, getCinemasAndShowtimes, getShowtimeSeats, checkout } from '../../services/bookingService';
import { getMovieById, getNowShowing, getHomeMovies } from '../../services/movieService';
import { getApplicableVouchers } from '../../services/voucherService';
import { getActiveCombos } from '../../services/comboService';
import { DEFAULT_POSTER, formatDate, formatDuration, getPosterUrl, getAgeRatingLabel } from '../../utils/movieUtils';
import './BookingPage.css';

export default function BookingPage() {
  const { movieId: routeMovieId } = useParams();
  const navigate = useNavigate();

  // Active movie ID (from URL param or user selection)
  const [selectedMovieId, setSelectedMovieId] = useState(routeMovieId || null);

  // List of movies available for booking
  const [availableMovies, setAvailableMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [movieSearchTerm, setMovieSearchTerm] = useState('');

  // State for step management: 1 (Lịch & Rạp), 2 (Ghế), 3 (Combo), 4 (Thanh toán)
  const [step, setStep] = useState(1);

  // State for selected Movie details
  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(false);

  // --- Step 1 States ---
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  // --- Step 2 States ---
  const [seats, setSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // --- Step 3 States (Combos) ---
  const [combos, setCombos] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({}); // { comboId: quantity }

  // --- Step 4 States ---
  const [voucherCode, setVoucherCode] = useState('');
  const [applicableVouchers, setApplicableVouchers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync route param with state
  useEffect(() => {
    if (routeMovieId) {
      setSelectedMovieId(routeMovieId);
    }
  }, [routeMovieId]);

  // 1. Fetch available movies (NOW_SHOWING)
  useEffect(() => {
    const fetchAvailableMovies = async () => {
      setLoadingMovies(true);
      try {
        let list = [];
        try {
          const res = await getNowShowing();
          list = res.data || [];
        } catch (e) {
          console.warn("getNowShowing failed, trying getHomeMovies", e);
        }
        if (!list || list.length === 0) {
          const homeRes = await getHomeMovies();
          list = homeRes.data?.nowShowing || [];
        }
        setAvailableMovies(list);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phim đang chiếu:", err);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchAvailableMovies();
  }, []);

  // 2. Initialize Dates for booking
  useEffect(() => {
    const next7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    setDates(next7Days);
    setSelectedDate(next7Days[0]);
  }, []);

  // 3. Fetch selected movie details when selectedMovieId changes
  useEffect(() => {
    if (!selectedMovieId) {
      setMovie(null);
      return;
    }

    setLoadingMovie(true);
    getMovieById(selectedMovieId)
      .then(res => {
        setMovie(res.data);
        setStep(1);
        setSelectedShowtime(null);
        setSelectedSeats([]);
        setSelectedCombos({});
        setVoucherCode('');
      })
      .catch(err => {
        console.error("Lỗi tải thông tin phim:", err);
        setSelectedMovieId(null);
      })
      .finally(() => {
        setLoadingMovie(false);
      });
  }, [selectedMovieId]);

  // 4. Fetch applicable vouchers when entering step 4
  useEffect(() => {
    if (step === 4) {
      const originalPrice = calculateTotal();
      const ticketCount = selectedSeats.length;
      getApplicableVouchers(originalPrice, ticketCount)
        .then(res => setApplicableVouchers(res.data))
        .catch(console.error);
    }
  }, [step, selectedSeats, selectedCombos]);

  // 5. Fetch combos when entering step 3
  useEffect(() => {
    if (step === 3 && combos.length === 0) {
      getActiveCombos().then(setCombos).catch(console.error);
    }
  }, [step]);

  // 6. Fetch Cities when Date changes
  useEffect(() => {
    if (selectedMovieId && selectedDate) {
      getCitiesWithShowtimes(selectedMovieId, selectedDate)
        .then(res => {
          setCities(res || []);
          if (res && res.length > 0) setSelectedCity(res[0]);
          else {
            setSelectedCity('');
            setCinemas([]);
          }
        })
        .catch(console.error);
    }
  }, [selectedMovieId, selectedDate]);

  // 7. Fetch Cinemas when City changes
  useEffect(() => {
    if (selectedMovieId && selectedDate && selectedCity) {
      getCinemasAndShowtimes(selectedMovieId, selectedCity, selectedDate)
        .then(setCinemas)
        .catch(console.error);
    } else {
      setCinemas([]);
    }
  }, [selectedMovieId, selectedDate, selectedCity]);

  // Handle choosing a movie to book
  const handleSelectMovie = (id) => {
    setSelectedMovieId(id);
    navigate(`/booking/${id}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle switching back to movie list
  const handleChangeMovie = () => {
    setSelectedMovieId(null);
    setMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedCombos({});
    setVoucherCode('');
    navigate('/bookings', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 8. Fetch Seats when Showtime is selected & go to Step 2
  const handleSelectShowtime = async (showtime) => {
    setSelectedShowtime(showtime);
    try {
      const res = await getShowtimeSeats(showtime.id);
      setSeats(res.allSeats);
      setBookedSeatIds(res.bookedSeatIds || []);
      setSelectedSeats([]); // reset selection
      setSelectedCombos({}); // reset combos
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lấy sơ đồ ghế!');
    }
  };

  // 9. Handle Seat Selection
  const toggleSeat = (seat) => {
    if (bookedSeatIds.includes(seat.id)) return; // Không cho chọn ghế đã đặt

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const calculateTotal = () => {
    if (!selectedShowtime) return 0;
    let total = selectedSeats.length * selectedShowtime.basePrice;
    
    // Add combo prices
    combos.forEach(c => {
      if (selectedCombos[c.id]) {
        total += c.price * selectedCombos[c.id];
      }
    });

    return total;
  };

  const handleComboChange = (comboId, delta) => {
    setSelectedCombos(prev => {
      const current = prev[comboId] || 0;
      const next = current + delta;
      if (next < 0 || next > 10) return prev; // Limit max 10
      return { ...prev, [comboId]: next };
    });
  };

  // 10. Handle Checkout
  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế!');
      return;
    }
    
    setIsProcessing(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (!currentUser.id) {
        alert("Vui lòng đăng nhập để tiếp tục thanh toán.");
        navigate("/login");
        return;
      }
      const customerId = currentUser.id;

      const comboList = Object.entries(selectedCombos)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ comboId: parseInt(id), quantity: qty }));

      const requestPayload = {
        customerId: customerId, 
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map(s => s.id),
        voucherCode: voucherCode.trim() !== '' ? voucherCode : null,
        combos: comboList
      };

      const res = await checkout(requestPayload);
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Seat Map helper
  const renderSeatMap = () => {
    const rowMap = {};
    seats.forEach(seat => {
      if (!rowMap[seat.rowLabel]) rowMap[seat.rowLabel] = [];
      rowMap[seat.rowLabel].push(seat);
    });

    const sortedRows = Object.keys(rowMap).sort();

    return (
      <div className="seat-map-container">
        <div className="screen-indicator">MÀN HÌNH</div>
        <div className="seat-grid">
          {sortedRows.map(row => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              {rowMap[row]
                .sort((a, b) => a.columnNumber - b.columnNumber)
                .map(seat => {
                  const isBooked = bookedSeatIds.includes(seat.id);
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  
                  let seatClass = 'seat';
                  if (isBooked) seatClass += ' booked';
                  else if (isSelected) seatClass += ' selected';
                  else {
                    if (seat.seatType === 'VIP') seatClass += ' vip';
                    else if (seat.seatType === 'SWEETBOX') seatClass += ' sweetbox';
                    else seatClass += ' regular';
                  }

                  return (
                    <button
                      key={seat.id}
                      data-testid={`seat-${seat.rowLabel}${seat.columnNumber}`}
                      aria-label={`Ghế ${seat.rowLabel}${seat.columnNumber}`}
                      className={seatClass}
                      onClick={() => toggleSeat(seat)}
                      disabled={isBooked}
                    >
                      {seat.columnNumber}
                    </button>
                  );
                })}
              <span className="row-label">{row}</span>
            </div>
          ))}
        </div>
        
        <div className="seat-legend">
          <div className="legend-item"><span className="seat regular"></span> Thường</div>
          <div className="legend-item"><span className="seat vip"></span> VIP</div>
          <div className="legend-item"><span className="seat sweetbox"></span> Sweetbox</div>
          <div className="legend-item"><span className="seat selected"></span> Đang chọn</div>
          <div className="legend-item"><span className="seat booked"></span> Đã bán</div>
        </div>
      </div>
    );
  };

  // Filter movies for selection view
  const filteredMovies = availableMovies.filter(m => {
    if (!movieSearchTerm) return true;
    const term = movieSearchTerm.toLowerCase();
    return (
      m.title?.toLowerCase().includes(term) ||
      m.genre?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="booking-page-wrapper">
      <Header />

      <main className="booking-page container-fluid">
        {/* --- VIEW 1: WHEN NO MOVIE IS SELECTED -> DISPLAY MOVIES AVAILABLE FOR BOOKING --- */}
        {!selectedMovieId || !movie ? (
          <section className="movie-selection-container">
            <div className="movie-selection-hero">
              <span className="hero-badge">🎟️ ĐẶT VÉ TRỰC TUYẾN</span>
              <h1 className="hero-title">CHỌN PHIM ĐANG CHIẾU</h1>
              <p className="hero-desc">
                Chọn ngay một bộ phim đang chiếu tại hệ thống rạp Cinemax để tiếp tục chọn ngày, rạp và chỗ ngồi yêu thích.
              </p>

              <div className="movie-search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="movie-search-input"
                  placeholder="Tìm kiếm phim đang chiếu theo tên, thể loại..."
                  value={movieSearchTerm}
                  onChange={(e) => setMovieSearchTerm(e.target.value)}
                />
                {movieSearchTerm && (
                  <button className="clear-search-btn" onClick={() => setMovieSearchTerm('')}>✕</button>
                )}
              </div>
            </div>

            {loadingMovies ? (
              <div className="loading-state-box">
                <div className="booking-spinner"></div>
                <p>Đang tải danh sách phim có thể đặt vé...</p>
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="available-movies-grid">
                {filteredMovies.map(m => {
                  const poster = getPosterUrl(m.posterUrl || m.images || m.image);
                  return (
                    <div 
                      key={m.id} 
                      className="available-movie-card"
                      onClick={() => handleSelectMovie(m.id)}
                    >
                      <div className="card-poster-wrapper">
                        <img 
                          src={poster} 
                          alt={m.title} 
                          className="card-poster"
                          onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                        />
                        <span className="card-badge age-badge">
                          {m.ageRestriction || 'P'}
                        </span>
                        <span className="card-badge status-badge">
                          Đang chiếu
                        </span>
                        <div className="card-hover-overlay">
                          <button 
                            className="btn-select-movie" 
                            onClick={(e) => { e.stopPropagation(); handleSelectMovie(m.id); }}
                          >
                            🎟️ ĐẶT VÉ NGAY
                          </button>
                          <button 
                            className="btn-view-details" 
                            onClick={(e) => { e.stopPropagation(); navigate(`/movies/${m.id}`); }}
                          >
                            ℹ️ Xem chi tiết
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        <h3 className="movie-card-title" title={m.title}>{m.title}</h3>
                        <div className="movie-card-meta">
                          <span>⏱️ {formatDuration(m.duration)}</span>
                          {m.releaseDate && <span>📅 {formatDate(m.releaseDate)}</span>}
                        </div>
                        <button 
                          className="btn-book-now" 
                          onClick={(e) => { e.stopPropagation(); handleSelectMovie(m.id); }}
                        >
                          Chọn Suất Chiếu →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-movies-found">
                <span className="empty-icon">🎬</span>
                <h3>Không tìm thấy phim phù hợp</h3>
                <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ.</p>
                <button className="btn btn-secondary mt-3" onClick={() => setMovieSearchTerm('')}>
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            )}
          </section>
        ) : (
          /* --- VIEW 2: WHEN A MOVIE IS SELECTED -> SHOW BOOKING STEPS --- */
          <>
            {/* Header info of the selected movie */}
            <div className="booking-header">
              <div className="booking-header-inner">
                <div className="booking-header-poster-wrap">
                  <img
                    src={getPosterUrl(movie.posterUrl || movie.images || movie.image)}
                    alt={movie.title}
                    className="booking-header-poster"
                    onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                  />
                </div>
                <div className="booking-header-info">
                  <span className="booking-status-tag">🎬 ĐANG CHỌN ĐẶT VÉ</span>
                  <h2>{movie.title}</h2>
                  <p className="booking-meta">
                    <span>⏱️ {formatDuration(movie.duration)}</span>
                    <span>🏷️ {movie.genre || (movie.genres ? movie.genres.map(g => g.name).join(', ') : "Phim chiếu rạp")}</span>
                    {movie.ageRestriction && <span>🔞 {getAgeRatingLabel(movie.ageRestriction)}</span>}
                  </p>
                </div>
                <button className="change-movie-btn" onClick={handleChangeMovie} title="Chọn phim khác">
                  🔄 Đổi phim khác
                </button>
              </div>
            </div>

            {/* Quick movie switcher bar in Step 1 */}
            {step === 1 && availableMovies.length > 1 && (
              <div className="quick-movie-switch-container">
                <span className="quick-switch-label">Phim đang chiếu khác:</span>
                <div className="quick-movie-scroll">
                  {availableMovies.map(otherMovie => {
                    const isCurrent = otherMovie.id === movie.id;
                    return (
                      <button
                        key={otherMovie.id}
                        className={`quick-movie-chip ${isCurrent ? 'active' : ''}`}
                        onClick={() => handleSelectMovie(otherMovie.id)}
                        disabled={isCurrent}
                      >
                        <img 
                          src={getPosterUrl(otherMovie.posterUrl || otherMovie.images || otherMovie.image)} 
                          alt={otherMovie.title}
                          className="chip-poster" 
                          onError={(e) => { e.target.src = DEFAULT_POSTER; }}
                        />
                        <span className="chip-title">{otherMovie.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Chọn Ngày & Rạp & Suất chiếu */}
            {step === 1 && (
              <div className="booking-step step-1">
                <div className="step-header">
                  <button className="back-btn" onClick={handleChangeMovie}>
                    ← Chọn phim khác
                  </button>
                  <h3>Chọn Ngày & Rạp</h3>
                </div>
                
                <div className="date-selector">
                  {dates.map(dateStr => {
                    const d = new Date(dateStr);
                    return (
                      <button 
                        key={dateStr} 
                        data-testid={`booking-date-${dateStr}`}
                        data-date={dateStr}
                        className={`date-btn ${selectedDate === dateStr ? 'active' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <span className="month">Tháng {d.getMonth() + 1}</span>
                        <span className="day">{d.getDate()}</span>
                        <span className="dow">{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
                      </button>
                    );
                  })}
                </div>

                {cities.length > 0 ? (
                  <div className="city-selector">
                    {cities.map(city => (
                      <button
                        key={city}
                        data-testid="booking-city"
                        className={`city-btn ${selectedCity === city ? 'active' : ''}`}
                        onClick={() => setSelectedCity(city)}
                      >
                        📍 {city}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Không có lịch chiếu nào cho phim này trong ngày đã chọn.</p>
                )}

                {cinemas.length > 0 && (
                  <div className="cinema-list">
                    {cinemas.map(c => (
                      <div key={c.cinema.id} className="cinema-item">
                        <h4>{c.cinema.name}</h4>
                        <div className="showtime-grid">
                          {c.showtimes.map(st => {
                            const timeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                            return (
                              <button 
                                key={st.id} 
                                data-testid={`showtime-${st.id}`}
                                className="showtime-btn"
                                onClick={() => handleSelectShowtime(st)}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Chọn Ghế */}
            {step === 2 && (
              <div className="booking-step step-2">
                <div className="step-header">
                  <button className="back-btn" onClick={() => setStep(1)}>← Chọn lại suất chiếu</button>
                  <h3>Chọn Ghế Ngồi</h3>
                </div>
                
                {renderSeatMap()}

                <div className="booking-summary-bar">
                  <div className="summary-info">
                    <p><strong>Rạp:</strong> {selectedShowtime?.cinemaName} - {selectedShowtime?.roomName}</p>
                    <p><strong>Suất chiếu:</strong> {new Date(selectedShowtime?.startTime).toLocaleString('vi-VN')}</p>
                    <p><strong>Ghế đã chọn:</strong> {selectedSeats.map(s => `${s.rowLabel}${s.columnNumber}`).join(', ') || 'Chưa chọn'}</p>
                    <h3 className="total-price">Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} VNĐ</h3>
                  </div>
                  <button 
                    id="booking-next"
                    data-testid="booking-next"
                    className="btn btn-primary next-btn" 
                    disabled={selectedSeats.length === 0}
                    onClick={() => setStep(3)}
                  >
                    Tiếp tục chọn Bắp Nước →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Chọn Combo Bắp Nước */}
            {step === 3 && (
              <div className="booking-step step-3">
                <div className="step-header">
                  <button className="back-btn" onClick={() => setStep(2)}>← Chọn lại ghế</button>
                  <h3>Chọn Combo Bắp Nước</h3>
                </div>

                <div className="combo-list">
                  {combos.map(combo => (
                    <div key={combo.id} className="combo-item">
                      {combo.imageUrl && (
                        <img src={combo.imageUrl} alt={combo.name} className="combo-image" />
                      )}
                      <div className="combo-info">
                        <h4>{combo.name}</h4>
                        <p>{combo.description}</p>
                        <p className="combo-price">{combo.price.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <div className="combo-quantity-controls">
                        <button onClick={() => handleComboChange(combo.id, -1)}>-</button>
                        <span>{selectedCombos[combo.id] || 0}</span>
                        <button onClick={() => handleComboChange(combo.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="booking-summary-bar">
                  <div className="summary-info">
                    <h3 className="total-price">Tổng tiền: {calculateTotal().toLocaleString('vi-VN')} VNĐ</h3>
                  </div>
                  <button 
                    className="btn btn-primary next-btn" 
                    onClick={() => setStep(4)}
                  >
                    Tiến hành Thanh Toán →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Thanh toán */}
            {step === 4 && (
              <div className="booking-step step-4">
                <div className="step-header">
                  <button className="back-btn" onClick={() => setStep(3)}>← Chọn lại Bắp Nước</button>
                  <h3>Xác Nhận & Thanh Toán</h3>
                </div>

                <div className="checkout-card">
                  <h4>Thông tin đơn đặt vé</h4>
                  <div className="checkout-details">
                    <p><strong>Phim:</strong> {movie?.title}</p>
                    <p><strong>Rạp:</strong> {selectedShowtime?.cinemaName} - {selectedShowtime?.roomName}</p>
                    <p><strong>Suất chiếu:</strong> {new Date(selectedShowtime?.startTime).toLocaleString('vi-VN')}</p>
                    <p><strong>Ghế:</strong> {selectedSeats.map(s => `${s.rowLabel}${s.columnNumber}`).join(', ')}</p>
                    {Object.keys(selectedCombos).length > 0 && (
                      <p><strong>Bắp Nước:</strong> {
                        combos.filter(c => selectedCombos[c.id] > 0)
                              .map(c => `${c.name} x${selectedCombos[c.id]}`)
                              .join(', ') || 'Không chọn'
                      }</p>
                    )}
                    <p><strong>Tạm tính:</strong> {calculateTotal().toLocaleString('vi-VN')} VNĐ</p>
                  </div>

                  <div className="voucher-section">
                    <label>Mã Ưu Đãi (Voucher):</label>
                    <div className="voucher-input-group">
                      <input 
                        type="text" 
                        value={voucherCode} 
                        onChange={e => setVoucherCode(e.target.value)} 
                        placeholder="Nhập mã voucher (nếu có)"
                      />
                    </div>
                    <small className="text-muted">Tổng tiền thực tế sẽ được áp dụng trực tiếp qua cổng thanh toán VNPay.</small>
                    
                    {applicableVouchers.length > 0 && (
                      <div className="voucher-suggestions">
                        <p className="voucher-suggestions-title">Voucher khả dụng cho đơn hàng này:</p>
                        <div className="voucher-list">
                          {applicableVouchers.map(v => (
                            <div key={v.id} className="voucher-suggestion-item">
                              <div className="voucher-info">
                                <strong>{v.code}</strong> - {v.decoratorDescription || v.description}
                              </div>
                              <button 
                                className="btn-apply-voucher" 
                                onClick={() => setVoucherCode(v.code)}
                              >
                                Áp dụng
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="checkout-actions">
                    <button 
                      className="btn btn-vnpay" 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Đang kết nối VNPay...' : 'THANH TOÁN QUA VNPAY'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
