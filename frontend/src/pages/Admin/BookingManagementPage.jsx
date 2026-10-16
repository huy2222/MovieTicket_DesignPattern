import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  getBookingOverview,
  getBookingsByMovie,
  getBookingTrend,
  getAllBookings,
} from "../../services/bookingAdminService";
import "./BookingManagementPage.css";

// ============================================
// Helpers
// ============================================

const STATUS_LABELS = {
  CONFIRMED: "Đã xác nhận",
  PENDING: "Đang chờ",
  CANCELLED: "Đã huỷ",
  EXPIRED: "Hết hạn",
};

function formatCurrency(amount) {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + "B";
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M";
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + "K";
  }
  return amount.toLocaleString("vi-VN");
}

function formatFullCurrency(amount) {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Tháng ${i + 1}`,
}));

const QUARTERS = [
  { value: 1, label: "Quý 1 (T1-T3)" },
  { value: 2, label: "Quý 2 (T4-T6)" },
  { value: 3, label: "Quý 3 (T7-T9)" },
  { value: 4, label: "Quý 4 (T10-T12)" },
];

const YEARS = [2024, 2025, 2026];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentQuarter = Math.ceil(currentMonth / 3);

// ============================================
// Custom Tooltip for Charts
// ============================================

function MovieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-custom-tooltip">
      <div className="chart-tooltip-label">{data.movieTitle}</div>
      <div className="chart-tooltip-row">
        🎫 Vé bán: <span>{data.ticketCount.toLocaleString("vi-VN")}</span>
      </div>
      <div className="chart-tooltip-row">
        💰 Doanh thu: <span>{formatFullCurrency(data.revenue)}</span>
      </div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="chart-custom-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      <div className="chart-tooltip-row">
        🎫 Vé bán: <span>{data.ticketCount.toLocaleString("vi-VN")}</span>
      </div>
      <div className="chart-tooltip-row">
        💰 Doanh thu: <span>{formatFullCurrency(data.revenue)}</span>
      </div>
    </div>
  );
}

// ============================================
// Component
// ============================================

export default function BookingManagementPage() {
  // Filter state
  const [filterType, setFilterType] = useState("MONTH");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [quarter, setQuarter] = useState(currentQuarter);

  // Data state
  const [overview, setOverview] = useState(null);
  const [movieStats, setMovieStats] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tableStatusFilter, setTableStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Build filter params
  const getFilterParams = useCallback(() => {
    const params = { filterType, year };
    if (filterType === "MONTH") params.month = month;
    if (filterType === "QUARTER") params.quarter = quarter;
    return params;
  }, [filterType, year, month, quarter]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = getFilterParams();

      const [overviewRes, movieRes, trendRes, bookingsRes] = await Promise.all([
        getBookingOverview(params),
        getBookingsByMovie({ ...params, limit: 10 }),
        getBookingTrend(params),
        getAllBookings(params),
      ]);

      setOverview(overviewRes.data);
      setMovieStats(movieRes.data);
      setTrendData(trendRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Error fetching booking data:", err);
    } finally {
      setLoading(false);
    }
  }, [getFilterParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter bookings table by status
  const filteredBookings =
    tableStatusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === tableStatusFilter);

  // ============================================
  // Render
  // ============================================
  return (
    <div className="booking-management-page">
      {/* Header */}
      <div className="booking-page-header">
        <h1 className="booking-page-title">
          <span className="booking-page-title-icon">🎫</span>
          Quản lý Đặt Vé
        </h1>
      </div>

      {/* Filter Bar */}
      <div className="booking-filter-bar">
        <div className="booking-filter-group">
          <span className="booking-filter-label">Lọc theo:</span>
          <select
            className="booking-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="MONTH">Tháng</option>
            <option value="QUARTER">Quý</option>
            <option value="YEAR">Năm</option>
          </select>
        </div>

        <div className="booking-filter-group">
          <span className="booking-filter-label">Năm:</span>
          <select
            className="booking-filter-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {filterType === "MONTH" && (
          <div className="booking-filter-group">
            <span className="booking-filter-label">Tháng:</span>
            <select
              className="booking-filter-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterType === "QUARTER" && (
          <div className="booking-filter-group">
            <span className="booking-filter-label">Quý:</span>
            <select
              className="booking-filter-select"
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
            >
              {QUARTERS.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="booking-loading">
          <div className="booking-loading-spinner" />
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {overview && (
            <div className="booking-summary-cards">
              <div className="summary-card tickets">
                <div className="summary-card-icon">🎟️</div>
                <div className="summary-card-info">
                  <div className="summary-card-label">Tổng vé đã bán</div>
                  <div className="summary-card-value">
                    {overview.totalTicketsSold.toLocaleString("vi-VN")}
                    <span className="summary-card-unit">vé</span>
                  </div>
                </div>
              </div>

              <div className="summary-card revenue">
                <div className="summary-card-icon">💰</div>
                <div className="summary-card-info">
                  <div className="summary-card-label">Tổng doanh thu</div>
                  <div className="summary-card-value">
                    {formatCurrency(overview.totalRevenue)}
                    <span className="summary-card-unit">VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="summary-card fillrate">
                <div className="summary-card-icon">📊</div>
                <div className="summary-card-info">
                  <div className="summary-card-label">Tỷ lệ lấp đầy</div>
                  <div className="summary-card-value">
                    {overview.fillRate.toFixed(1)}
                    <span className="summary-card-unit">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="booking-charts-section">
            {/* Bar Chart — Top phim */}
            <div className="booking-chart-card">
              <h3 className="booking-chart-title">
                <span className="booking-chart-title-icon">🏆</span>
                Top phim bán vé tốt nhất
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  layout="vertical"
                  data={movieStats}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" tick={{ fill: "#b0b0b8", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="movieTitle"
                    width={140}
                    tick={{ fill: "#b0b0b8", fontSize: 11 }}
                  />
                  <Tooltip content={<MovieTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#e50914" />
                      <stop offset="100%" stopColor="#ff6b6b" />
                    </linearGradient>
                  </defs>
                  <Bar
                    dataKey="ticketCount"
                    fill="url(#barGradient)"
                    barSize={20}
                    radius={[0, 6, 6, 0]}
                    name="Số vé"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line/Area Chart — Xu hướng */}
            <div className="booking-chart-card">
              <h3 className="booking-chart-title">
                <span className="booking-chart-title-icon">📈</span>
                Xu hướng bán vé
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#b0b0b8", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#b0b0b8", fontSize: 11 }} />
                  <Tooltip content={<TrendTooltip />} cursor={{ stroke: "rgba(229,9,20,0.3)" }} />
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e50914" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="ticketCount"
                    stroke="#e50914"
                    strokeWidth={2.5}
                    fill="url(#areaGradient)"
                    dot={{ r: 3, fill: "#e50914", stroke: "#fff", strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: "#e50914", stroke: "#fff", strokeWidth: 2 }}
                    name="Số vé"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Table */}
          <div className="booking-table-section">
            <div className="booking-table-header">
              <h3 className="booking-table-title">
                📋 Chi tiết đặt vé gần đây
              </h3>
              <select
                className="booking-table-filter"
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="CONFIRMED">✅ Đã xác nhận</option>
                <option value="PENDING">⏳ Đang chờ</option>
                <option value="CANCELLED">❌ Đã huỷ</option>
              </select>
            </div>

            <div className="booking-table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khách hàng</th>
                    <th>Phim</th>
                    <th>Rạp chiếu</th>
                    <th>Lịch chiếu</th>
                    <th>Ghế</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                        Không có dữ liệu booking phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, idx) => (
                      <tr key={b.bookingId}>
                        <td style={{ color: "var(--text-muted)", fontFamily: "var(--mono)", fontSize: "0.75rem" }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.customerEmail}</div>
                        </td>
                        <td style={{ fontWeight: 600, maxWidth: "160px" }}>{b.movieTitle}</td>
                        <td>
                          <div>{b.cinemaName}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.roomName}</div>
                        </td>
                        <td>
                          <div>{b.showDate}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{b.showtime}</div>
                        </td>
                        <td>
                          <div className="booking-seats">
                            {b.seatLabels.map((s) => (
                              <span key={s} className="seat-tag">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="booking-table-amount">
                            {formatFullCurrency(b.totalAmount)}
                          </span>
                        </td>
                        <td>
                          <span className={`booking-status ${b.status.toLowerCase()}`}>
                            {STATUS_LABELS[b.status] || b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
