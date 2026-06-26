import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import TicketCard from "../../components/ticket/TicketCard";
import { getMyBookings } from "../../services/bookingUserService";
import "./MyTicketsPage.css";

// ============================================
// Helpers
// ============================================

/**
 * Parse a "dd/mm/yyyy" date string to a Date object
 */
function parseDateStr(dateStr) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "UPCOMING", label: "Sắp chiếu" },
  { key: "WATCHED", label: "Đã xem" },
  { key: "CANCELLED", label: "Đã huỷ" },
];

// ============================================
// Component
// ============================================

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await getMyBookings();
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter bookings based on active tab
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const showDate = parseDateStr(b.showDate);

    switch (activeTab) {
      case "UPCOMING":
        return showDate >= now && (b.status === "CONFIRMED" || b.status === "PENDING");
      case "WATCHED":
        return showDate < now || b.status === "USED";
      case "CANCELLED":
        return b.status === "CANCELLED";
      default:
        return true;
    }
  });

  // Count per tab for badges
  const tabCounts = {
    ALL: bookings.length,
    UPCOMING: bookings.filter(
      (b) => parseDateStr(b.showDate) >= now && (b.status === "CONFIRMED" || b.status === "PENDING")
    ).length,
    WATCHED: bookings.filter(
      (b) => parseDateStr(b.showDate) < now || b.status === "USED"
    ).length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="my-tickets-page">
      <Header />

      <div className="my-tickets-container">
        {/* Header */}
        <div className="my-tickets-header">
          <h1 className="my-tickets-title">
            <span className="my-tickets-title-icon">🎬</span>
            Vé của tôi
          </h1>
          <p className="my-tickets-subtitle">
            Xem lại danh sách các vé bạn đã đặt tại CINEMAX
          </p>
        </div>

        {/* Tabs */}
        <div className="my-tickets-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`my-tickets-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className="my-tickets-tab-count">{tabCounts[tab.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="my-tickets-loading">
            <div className="my-tickets-loading-spinner" />
            <p>Đang tải danh sách vé...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="my-tickets-empty">
            <div className="my-tickets-empty-icon">🎫</div>
            <h3>
              {activeTab === "ALL"
                ? "Bạn chưa đặt vé nào"
                : `Không có vé nào ${
                    activeTab === "UPCOMING"
                      ? "sắp chiếu"
                      : activeTab === "WATCHED"
                      ? "đã xem"
                      : "đã huỷ"
                  }`}
            </h3>
            <p>Hãy khám phá những bộ phim hấp dẫn tại CINEMAX!</p>
            <Link to="/" className="my-tickets-empty-cta">
              🎬 Xem phim ngay
            </Link>
          </div>
        ) : (
          <div className="my-tickets-list">
            {filteredBookings.map((booking) => (
              <TicketCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
