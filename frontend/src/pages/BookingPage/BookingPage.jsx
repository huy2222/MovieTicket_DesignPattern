import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCitiesWithShowtimes, getCinemasAndShowtimes, getShowtimeSeats, checkout } from '../../services/bookingService';
import { getMovieById } from '../../services/movieService';
import './BookingPage.css';

export default function BookingPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // State for step management
  const [step, setStep] = useState(1);

  // State for Movie details
  const [movie, setMovie] = useState(null);

  // --- Step 1 States ---
  // Dates: Next 7 days
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

  // --- Step 3 States ---
  const [voucherCode, setVoucherCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Initialize Dates & Fetch Movie
  useEffect(() => {
    // Generate next 7 days
    const next7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
    setDates(next7Days);
    setSelectedDate(next7Days[0]);

    // Fetch movie
    getMovieById(movieId).then(res => setMovie(res.data)).catch(console.error);
  }, [movieId]);

  // 2. Fetch Cities when Date changes
  useEffect(() => {
    if (movieId && selectedDate) {
      getCitiesWithShowtimes(movieId, selectedDate)
        .then(res => {
          setCities(res);
          if (res.length > 0) setSelectedCity(res[0]);
          else {
            setSelectedCity('');
            setCinemas([]);
          }
        })
        .catch(console.error);
    }
  }, [movieId, selectedDate]);

  // 3. Fetch Cinemas when City changes
  useEffect(() => {
    if (movieId && selectedDate && selectedCity) {
      getCinemasAndShowtimes(movieId, selectedCity, selectedDate)
        .then(setCinemas)
        .catch(console.error);
    } else {
      setCinemas([]);
    }
  }, [movieId, selectedDate, selectedCity]);

  // 4. Fetch Seats when Showtime is selected & go to Step 2
  const handleSelectShowtime = async (showtime) => {
    setSelectedShowtime(showtime);
    try {
      const res = await getShowtimeSeats(showtime.id);
      setSeats(res.allSeats);
      setBookedSeatIds(res.bookedSeatIds || []);
      setSelectedSeats([]); // reset selection
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lấy sơ đồ ghế!');
    }
  };

  // 5. Handle Seat Selection
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
    return selectedSeats.length * selectedShowtime.basePrice;
  };

  // 6. Handle Checkout
  const handleCheckout = async () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ghế!');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Dùng customerId 1 làm mặc định nếu chưa auth
      const requestPayload = {
        customerId: 1, 
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map(s => s.id),
        voucherCode: voucherCode.trim() !== '' ? voucherCode : null
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

  // --- Render Helpers ---

  // Build a grid of seats
  // This assumes seats have rowLabel (A, B, C...) and columnNumber (1, 2, 3...)
  const renderSeatMap = () => {
    // Group seats by row
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

  return (
    <div className="booking-page container-fluid">
      {movie && (
        <div className="booking-header">
          <h2>{movie.title}</h2>
          <p>Thể loại: {movie.genre} | Thời lượng: {movie.duration} phút</p>
        </div>
      )}

      {step === 1 && (
        <div className="booking-step step-1">
          <div className="step-header">
            <button className="back-btn" onClick={() => navigate('/')}>← Quay lại trang chủ</button>
            <h3>Chọn Ngày & Rạp</h3>
          </div>
          
          <div className="date-selector">
            {dates.map(dateStr => {
              const d = new Date(dateStr);
              return (
                <button 
                  key={dateStr} 
                  className={`date-btn ${selectedDate === dateStr ? 'active' : ''}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className="month">{d.getMonth() + 1}</span>
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
                  className={`city-btn ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          ) : (
            <p className="no-data">Không có lịch chiếu nào trong ngày này.</p>
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

      {step === 2 && (
        <div className="booking-step step-2">
          <div className="step-header">
            <button className="back-btn" onClick={() => setStep(1)}>← Trở lại</button>
            <h3>Chọn Ghế</h3>
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
              className="btn btn-primary next-btn" 
              disabled={selectedSeats.length === 0}
              onClick={() => setStep(3)}
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="booking-step step-3">
          <div className="step-header">
            <button className="back-btn" onClick={() => setStep(2)}>← Chọn lại ghế</button>
            <h3>Thanh Toán</h3>
          </div>

          <div className="checkout-card">
            <h4>Thông tin vé</h4>
            <div className="checkout-details">
              <p><strong>Phim:</strong> {movie?.title}</p>
              <p><strong>Rạp:</strong> {selectedShowtime?.cinemaName} - {selectedShowtime?.roomName}</p>
              <p><strong>Suất chiếu:</strong> {new Date(selectedShowtime?.startTime).toLocaleString('vi-VN')}</p>
              <p><strong>Ghế:</strong> {selectedSeats.map(s => `${s.rowLabel}${s.columnNumber}`).join(', ')}</p>
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
              <small className="text-muted">Tổng tiền thực tế sẽ được áp dụng trực tiếp bên trang thanh toán VNPay.</small>
            </div>

            <div className="checkout-actions">
              <button 
                className="btn btn-vnpay" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang xử lý...' : 'THANH TOÁN QUA VNPAY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
