import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardCharts, getDashboardOverview } from "../../../services/dashboardAdminService";
import { getApiErrorMessage } from "../../../utils/apiError";
import "./DashboardPage.css";

const PERIOD_OPTIONS = [
  { value: "TODAY", label: "Hôm nay" },
  { value: "LAST_7_DAYS", label: "7 ngày" },
  { value: "LAST_30_DAYS", label: "30 ngày" },
  { value: "MONTH", label: "Theo tháng" },
  { value: "YEAR", label: "Theo năm" },
  { value: "CUSTOM", label: "Tùy chọn" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
}

function formatMoneyAxis(value) {
  if (!value) return "0";

  if (value >= 1_000_000_000) {
    const v = value / 1_000_000_000;
    return `${Number(v.toFixed(1))}B`;
  }

  if (value >= 1_000_000) {
    const v = value / 1_000_000;
    return `${Number(v.toFixed(1))}M`;
  }

  if (value >= 1_000) {
    const v = value / 1_000;
    return `${Number(v.toFixed(1))}K`;
  }

  return value.toString();
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("LAST_30_DAYS");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({
    period: "LAST_30_DAYS",
    fromDate: "",
    toDate: "",
  });

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview", appliedFilter],
    queryFn: async () => {
      const params = {
        period: appliedFilter.period,
      };

      if (appliedFilter.period === "CUSTOM") {
        params.fromDate = appliedFilter.fromDate;
        params.toDate = appliedFilter.toDate;
      }

      const res = await getDashboardOverview(params);
      return res.data;
    },
    staleTime: 5 * 60_000,
    enabled: appliedFilter.period !== "CUSTOM" || (!!appliedFilter.fromDate && !!appliedFilter.toDate),
  });

  const chartsQuery = useQuery({
    queryKey: ["dashboard", "charts", appliedFilter],
    queryFn: async () => {
      const params = { period: appliedFilter.period };
      if (appliedFilter.period === "CUSTOM") {
        params.fromDate = appliedFilter.fromDate;
        params.toDate = appliedFilter.toDate;
      }
      const res = await getDashboardCharts(params);
      return res.data;
    },
    enabled: appliedFilter.period !== "CUSTOM" || (appliedFilter.fromDate && appliedFilter.toDate),
  });

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setAppliedFilter({ period, fromDate, toDate });
  };

  const overview = overviewQuery.data;
  const charts = chartsQuery.data;

  const getRevenueCard = () => {
    if (!overview) return null;
    let label = "Doanh thu";
    let value = overview.revenueToday;
    if (appliedFilter.period === "TODAY") {
      label = "Doanh thu hôm nay";
      value = overview.revenueToday;
    } else if (appliedFilter.period === "LAST_7_DAYS") {
      label = "Doanh thu 7 ngày";
      value = overview.revenueThisWeek;
    } else if (appliedFilter.period === "LAST_30_DAYS") {
      label = "Doanh thu 30 ngày";
      value = overview.revenueThisMonth;
    } else if (appliedFilter.period === "MONTH") {
      label = "Doanh thu tháng hiện tại";
      value = overview.revenueThisMonth;
    } else if (appliedFilter.period === "YEAR") {
      label = "Doanh thu năm hiện tại";
      value = overview.revenueThisYear;
    } else if (appliedFilter.period === "CUSTOM") {
      label = `Doanh thu từ ${appliedFilter.fromDate} đến ${appliedFilter.toDate}`;
      value = overview.revenueToday;
    }
    return { label, value: formatCurrency(value), accent: "gold" };
  };

  const statCards = overview
    ? [
        getRevenueCard(),
        { label: "Tổng vé bán", value: formatNumber(overview.totalTicketsSold), accent: "blue" },
        { label: "Tổng đơn hàng", value: formatNumber(overview.totalBookings), accent: "blue" },
        { label: "Tổng khách hàng", value: formatNumber(overview.totalCustomers), accent: "blue" },
        { label: "Phim đang chiếu", value: formatNumber(overview.moviesNowShowing), accent: "green" },
        { label: appliedFilter.period === "TODAY" ? "Suất chiếu hôm nay" : "Suất chiếu trong kỳ", value: formatNumber(overview.showtimesToday), accent: "green" },
        { label: "Tổng nhân viên", value: formatNumber(overview.totalEmployees), accent: "green" },
      ].filter(Boolean)
    : [];

  const isLoading = overviewQuery.isLoading || chartsQuery.isLoading;
  const error = overviewQuery.error || chartsQuery.error;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Tổng quan doanh thu</h1>
      </div>

      {error && (
        <div className="dashboard-error">
          {getApiErrorMessage(error, "Không thể tải dữ liệu dashboard")}
        </div>
      )}

      <div className="dashboard-stats-grid">
        {overviewQuery.isLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="dashboard-stat-card skeleton" />
            ))
          : statCards.map((card) => (
              <div key={card.label} className={`dashboard-stat-card accent-${card.accent}`}>
                <span className="dashboard-stat-label">{card.label}</span>
                <span className="dashboard-stat-value">{card.value}</span>
              </div>
            ))}
      </div>

      <form className="dashboard-filter-bar" onSubmit={handleApplyFilter}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="dashboard-filter-select"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {period === "CUSTOM" && (
          <>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="dashboard-filter-input"
              required
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="dashboard-filter-input"
              required
            />
          </>
        )}

        <button type="submit" className="dashboard-filter-btn">
          Áp dụng bộ lọc
        </button>
      </form>

      {isLoading && !charts ? (
        <div className="dashboard-loading">Đang tải biểu đồ...</div>
      ) : (
        charts && (
          <div className="dashboard-charts-grid">
            <div className="dashboard-chart-card full-width">
              <h3>Doanh thu 12 tháng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" fontSize={12} tickFormatter={formatMoneyAxis} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#ffd700" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-card">
              <h3>Top phim doanh thu</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.topMoviesByRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#aaa" tickFormatter={formatMoneyAxis} />
                  <YAxis type="category" dataKey="movieTitle" stroke="#aaa" width={120} fontSize={11} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#e50914" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-card">
              <h3>Top phim bán vé</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.topMoviesByTickets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#aaa" />
                  <YAxis type="category" dataKey="movieTitle" stroke="#aaa" width={120} fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="ticketCount" name="Số vé" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-card">
              <h3>Doanh thu theo rạp</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.revenueByCinema}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="cinemaName" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" tickFormatter={formatMoneyAxis} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-card">
              <h3>Vé bán theo ngày</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={charts.ticketsSoldByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                  <Line type="monotone" dataKey="ticketCount" name="Số vé" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-chart-card">
              <h3>Doanh thu theo khung giờ</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={charts.revenueByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="label" stroke="#aaa" fontSize={11} />
                  <YAxis stroke="#aaa" tickFormatter={formatMoneyAxis} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      )}
    </div>
  );
}
