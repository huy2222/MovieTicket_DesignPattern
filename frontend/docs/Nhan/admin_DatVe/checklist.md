# 🎫 Checklist - Chức năng Quản lý Đặt Vé (Admin & User)

> **Mục tiêu**:  
> - **Admin**: Xem tổng số vé đã bán theo tháng/quý/năm, thống kê biểu đồ phim bán vé tốt nhất, lọc linh hoạt.  
> - **User (Customer)**: Xem lại danh sách vé đã đặt với đầy đủ thông tin: Tên phim, giờ chiếu, lịch chiếu, tên rạp, số phòng, chỗ đã đặt.

---

## 📌 Tổng quan kiến trúc dữ liệu hiện có

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Customer │────▶│ Booking  │────▶│ Ticket   │────▶│  Seat    │
└──────────┘     └────┬─────┘     └────┬─────┘     └──────────┘
                      │                │
                      ▼                ▼
                 ┌──────────┐    ┌──────────┐     ┌──────────┐
                 │ Showtime │───▶│  Movie   │     │  Room    │
                 └────┬─────┘    └──────────┘     └──────────┘
                      │                                 │
                      ▼                                 │
                 ┌──────────┐                           │
                 │  Cinema  │◀──────────────────────────┘
                 └──────────┘
```

**Quan hệ chính**:
- `Customer` → 1:N → `Booking` → 1:N → `Ticket`
- `Booking` → N:1 → `Showtime` → N:1 → `Movie`
- `Showtime` → N:1 → `Cinema`
- `Showtime` → N:1 → `Room`
- `Ticket` → N:1 → `Seat` (ghế cụ thể: hàng + cột)

---

---

# 🏢 PHASE 1: ADMIN — Thống kê & Quản lý Đặt Vé

---

# 🖥️ PHẦN 1.1: FRONTEND (React + Vite)

---

## Step 1: Cập nhật AdminSidebar — Thêm mục "Quản lý Đặt Vé"

> **Mục đích**: Thêm link điều hướng tới trang quản lý đặt vé trong sidebar admin.

### 📁 Files cần sửa:
- `frontend/src/components/layout/AdminSidebar.jsx` — Thêm icon & NavLink

### 🔧 Hướng dẫn:

**1.1. Thêm icon `ticket` vào object `icons` trong `SidebarIcon`**
```jsx
ticket: (
  <svg {...commonProps}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
),
```

**1.2. Thêm NavLink mới sau mục "Lịch chiếu"**
```jsx
<NavLink
  to="/admin/bookings"
  className={({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`
  }
>
  <SidebarIcon name="ticket" />
  Quản lý Đặt Vé
</NavLink>
```

---

## Step 2: Cập nhật AppRoutes — Thêm route `/admin/bookings`

> **Mục đích**: Đăng ký route cho trang quản lý đặt vé của admin.

### 📁 Files cần sửa:
- `frontend/src/routes/AppRoutes.jsx`

### 🔧 Hướng dẫn:

```jsx
// Import trang mới
import BookingManagementPage from "../pages/Admin/BookingManagementPage";

// Thêm route trong group /admin
<Route path="bookings" element={<BookingManagementPage />} />
```

---

## Step 3: Tạo Service gọi API thống kê đặt vé

> **Mục đích**: Tạo file service chứa các hàm gọi API thống kê booking từ frontend tới backend.

### 📁 Files cần tạo:
- `frontend/src/services/bookingAdminService.js`

### 🔧 Hướng dẫn:

```js
import api from "../api/axiosConfig";

// Lấy thống kê tổng quan (tổng vé bán, doanh thu...)
export const getBookingOverview = (params) =>
  api.get("/admin/bookings/overview", { params });
// params: { filterType: "MONTH" | "QUARTER" | "YEAR", year: 2026, month: 6, quarter: 2 }

// Lấy thống kê theo phim (top phim bán vé)
export const getBookingsByMovie = (params) =>
  api.get("/admin/bookings/stats/by-movie", { params });
// params: { filterType: "MONTH" | "QUARTER" | "YEAR", year: 2026, month: 6, quarter: 2, limit: 10 }

// Lấy xu hướng bán vé theo thời gian (line chart)
export const getBookingTrend = (params) =>
  api.get("/admin/bookings/stats/trend", { params });
// params: { filterType: "MONTH" | "QUARTER" | "YEAR", year: 2026 }

// Lấy danh sách tất cả booking (phân trang)
export const getAllBookings = (params) =>
  api.get("/admin/bookings", { params });
// params: { page: 0, size: 20, status: "CONFIRMED", movieId: 1, cinemaId: 1 }
```

---

## Step 4: Tạo trang Quản lý Đặt Vé (BookingManagementPage)

> **Mục đích**: Trang admin hiển thị dashboard thống kê vé đã bán với biểu đồ và bộ lọc.

### 📁 Files cần tạo:
- `frontend/src/pages/Admin/BookingManagementPage.jsx`
- `frontend/src/pages/Admin/BookingManagementPage.css`

### 🔧 Hướng dẫn:

**4.1. Cấu trúc trang:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🎫 Quản lý Đặt Vé                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌── Bộ lọc ──────────────────────────────────────────────────┐ │
│  │  Lọc theo: [Tháng ▼]   Năm: [2026 ▼]   Tháng: [6 ▼]     │ │
│  │                          Quý: [Q2 ▼] (ẩn/hiện tuỳ filter)  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌── Thống kê tổng quan (Summary Cards) ──────────────────────┐ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │ 🎟️ Tổng vé  │  │ 💰 Doanh thu│  │ 📊 Tỷ lệ lấp đầy  │ │ │
│  │  │    1,245     │  │ 245.5M VNĐ  │  │      78.5%          │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌── Biểu đồ: Top phim bán vé tốt nhất (Bar Chart) ─────────┐ │
│  │                                                             │ │
│  │  Avengers        ████████████████████████  450 vé           │ │
│  │  Spider-Man      ██████████████████  350 vé                 │ │
│  │  Batman          ████████████████  300 vé                   │ │
│  │  Doraemon        ██████████████  280 vé                     │ │
│  │  Lật Mặt 8      ████████████  250 vé                       │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌── Biểu đồ: Xu hướng bán vé theo thời gian (Line Chart) ──┐ │
│  │         📈                                                  │ │
│  │      /\    /\                                               │ │
│  │     /  \  /  \    /\                                        │ │
│  │    /    \/    \  /  \                                       │ │
│  │   /            \/    \                                      │ │
│  │  T1  T2  T3  T4  T5  T6                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌── Bảng chi tiết Booking gần đây ──────────────────────────┐ │
│  │ #  │ Khách hàng │ Phim        │ Rạp     │ Ngày đặt │ Vé  │ │
│  │ 1  │ Nguyễn A   │ Avengers    │ Galaxy  │ 24/06    │ 3   │ │
│  │ 2  │ Trần B     │ Spider-Man  │ CGV     │ 23/06    │ 2   │ │
│  │ ...│ ...        │ ...         │ ...     │ ...      │ ... │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**4.2. Các chức năng chính:**

- **Summary Cards** (3 thẻ tổng quan):
  - 🎟️ **Tổng số vé đã bán**: Tổng tickets có status = `ISSUED` hoặc `USED` trong khoảng thời gian lọc
  - 💰 **Tổng doanh thu**: Tổng `totalAmount` của các booking CONFIRMED
  - 📊 **Tỷ lệ lấp đầy**: % ghế đã bán / tổng ghế khả dụng

- **Bộ lọc linh hoạt**:
  - Dropdown chọn loại lọc: `Tháng`, `Quý`, `Năm`
  - Dropdown chọn năm: `2024`, `2025`, `2026`
  - Dropdown chọn tháng (1-12): chỉ hiện khi lọc theo `Tháng`
  - Dropdown chọn quý (Q1-Q4): chỉ hiện khi lọc theo `Quý`
  - Khi thay đổi bộ lọc → tự động gọi lại API

- **Bar Chart — Top phim bán vé tốt nhất**:
  - Hiển thị top 10 phim có số lượng vé bán nhiều nhất
  - Thanh ngang (horizontal bar) với tên phim bên trái, số vé bên phải
  - Màu gradient cho thanh bar
  - Tooltip khi hover hiển thị chi tiết (số vé, doanh thu)

- **Line Chart — Xu hướng bán vé theo thời gian**:
  - Khi lọc theo `Năm` → hiển thị 12 điểm (12 tháng)
  - Khi lọc theo `Quý` → hiển thị 3 điểm (3 tháng trong quý)
  - Khi lọc theo `Tháng` → hiển thị từng ngày trong tháng

- **Bảng chi tiết Booking gần đây**:
  - Hiển thị danh sách booking mới nhất (phân trang, mỗi trang 20)
  - Cột: STT, Khách hàng, Phim, Rạp chiếu, Ngày đặt, Số vé, Tổng tiền, Trạng thái
  - Badge màu cho trạng thái:
    - 🟡 PENDING (vàng)
    - 🟢 CONFIRMED (xanh lá)
    - 🔴 CANCELLED (đỏ)
    - ⚫ EXPIRED (xám)

**4.3. Thư viện biểu đồ đề xuất:**
- Sử dụng **Chart.js** + **react-chartjs-2** (nhẹ, dễ tích hợp)
- Hoặc **Recharts** (React-native charts, responsive)

```bash
npm install chart.js react-chartjs-2
# hoặc
npm install recharts
```

> 💡 **Gợi ý**: Nên dùng **Recharts** vì nó là React component thuần, dễ customize hơn Chart.js, hỗ trợ responsive mặc định.

---

## Step 5: Tạo Component Summary Cards

> **Mục đích**: Component hiển thị 3 thẻ tổng quan (tổng vé, doanh thu, tỷ lệ lấp đầy).

### 📁 Files cần tạo:
- `frontend/src/components/booking/BookingSummaryCards.jsx`
- `frontend/src/components/booking/BookingSummaryCards.css`

### 🔧 Hướng dẫn:

```jsx
// Props: { totalTickets, totalRevenue, fillRate }
// Mỗi card gồm:
// - Icon (emoji hoặc SVG)
// - Label (VD: "Tổng vé đã bán")
// - Value (format số với dấu phẩy: 1,245)
// - So sánh với kỳ trước (optional): "+12% so với tháng trước" (nếu backend hỗ trợ)

// Thiết kế card:
// - Background gradient nhẹ
// - Border radius bo tròn
// - Hover effect: scale nhẹ + shadow
// - Icon animated (pulse nhẹ)
```

---

## Step 6: Tạo Component Biểu đồ Top Phim (MovieTicketChart)

> **Mục đích**: Biểu đồ cột ngang (horizontal bar chart) hiển thị top phim bán vé.

### 📁 Files cần tạo:
- `frontend/src/components/booking/MovieTicketChart.jsx`
- `frontend/src/components/booking/MovieTicketChart.css`

### 🔧 Hướng dẫn:

```jsx
// Props: { data: [{ movieTitle, ticketCount, revenue }] }

// Sử dụng Recharts BarChart (horizontal):
// <ResponsiveContainer width="100%" height={400}>
//   <BarChart layout="vertical" data={data}>
//     <XAxis type="number" />
//     <YAxis type="category" dataKey="movieTitle" width={150} />
//     <Tooltip content={<CustomTooltip />} />
//     <Bar dataKey="ticketCount" fill="url(#colorGradient)" barSize={24} radius={[0,6,6,0]} />
//   </BarChart>
// </ResponsiveContainer>

// CustomTooltip hiển thị:
// - Tên phim
// - Số vé: 450
// - Doanh thu: 135,000,000 VNĐ
```

---

## Step 7: Tạo Component Biểu đồ Xu hướng (TicketTrendChart)

> **Mục đích**: Biểu đồ đường (line chart) hiển thị xu hướng bán vé theo thời gian.

### 📁 Files cần tạo:
- `frontend/src/components/booking/TicketTrendChart.jsx`
- `frontend/src/components/booking/TicketTrendChart.css`

### 🔧 Hướng dẫn:

```jsx
// Props: { data: [{ label, ticketCount }], filterType }

// Sử dụng Recharts LineChart:
// <ResponsiveContainer width="100%" height={300}>
//   <LineChart data={data}>
//     <XAxis dataKey="label" />
//     <YAxis />
//     <Tooltip />
//     <Line type="monotone" dataKey="ticketCount" stroke="#e53935" strokeWidth={2} dot={{ r: 4 }} />
//     <Area type="monotone" dataKey="ticketCount" fill="rgba(229,57,53,0.1)" />
//   </LineChart>
// </ResponsiveContainer>

// label format:
// - Lọc theo Năm: "T1", "T2", ..., "T12"
// - Lọc theo Quý: "Tháng 1", "Tháng 2", "Tháng 3"
// - Lọc theo Tháng: "01", "02", ..., "30"
```

---

---

# ⚙️ PHẦN 1.2: BACKEND (Spring Boot + JPA)

---

## Step 8: Tạo DTO Response cho thống kê

> **Mục đích**: Tạo các DTO trả về dữ liệu thống kê cho frontend.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/dto/response/BookingOverviewResponse.java`
- `backend/src/main/java/org/example/backend/dto/response/MovieTicketStatsResponse.java`
- `backend/src/main/java/org/example/backend/dto/response/TicketTrendResponse.java`
- `backend/src/main/java/org/example/backend/dto/response/BookingDetailResponse.java`

### 🔧 Hướng dẫn:

**8.1. `BookingOverviewResponse.java`** — Thống kê tổng quan
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingOverviewResponse {
    private long totalTicketsSold;      // Tổng số vé đã bán
    private double totalRevenue;         // Tổng doanh thu (VNĐ)
    private double fillRate;             // Tỷ lệ lấp đầy (%)
    private String filterType;           // "MONTH", "QUARTER", "YEAR"
    private int year;
    private Integer month;               // null nếu lọc theo năm
    private Integer quarter;             // null nếu lọc theo tháng
}
```

**8.2. `MovieTicketStatsResponse.java`** — Thống kê theo phim
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieTicketStatsResponse {
    private Long movieId;
    private String movieTitle;           // Tên phim
    private String posterUrl;            // Poster (optional, cho UI đẹp hơn)
    private long ticketCount;            // Số vé bán được
    private double revenue;              // Doanh thu từ phim này
}
```

**8.3. `TicketTrendResponse.java`** — Xu hướng bán vé
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTrendResponse {
    private String label;                // "T1", "T2", ..., "01", "02", ...
    private long ticketCount;            // Số vé bán trong khoảng thời gian
    private double revenue;              // Doanh thu trong khoảng thời gian
}
```

**8.4. `BookingDetailResponse.java`** — Chi tiết 1 booking (cho bảng)
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailResponse {
    private Long bookingId;
    private String customerName;         // Tên khách hàng
    private String customerEmail;
    private String movieTitle;           // Tên phim
    private String cinemaName;           // Tên rạp
    private String roomName;             // Tên/số phòng
    private String showtime;             // Giờ chiếu (format: "14:30 - 16:45")
    private String showDate;             // Ngày chiếu (format: "24/06/2026")
    private int ticketCount;             // Số vé
    private double totalAmount;          // Tổng tiền
    private String status;               // PENDING, CONFIRMED, CANCELLED, EXPIRED
    private String bookingDate;          // Ngày đặt (format: "24/06/2026 08:30")
    private List<String> seatLabels;     // Danh sách ghế: ["A1", "A2", "B3"]
}
```

---

## Step 9: Tạo Repository — BookingRepository

> **Mục đích**: Tạo JPA Repository với các custom query thống kê.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/repository/BookingRepository.java`

### 🔧 Hướng dẫn:

```java
package org.example.backend.repository;

import org.example.backend.entity.Booking;
import org.example.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Đếm tổng vé bán trong khoảng thời gian (CONFIRMED booking)
    @Query("SELECT COUNT(t) FROM Ticket t " +
           "WHERE t.booking.status = 'CONFIRMED' " +
           "AND t.booking.bookingDate BETWEEN :startDate AND :endDate")
    long countTicketsSold(@Param("startDate") LocalDateTime startDate,
                          @Param("endDate") LocalDateTime endDate);

    // Tính tổng doanh thu trong khoảng thời gian
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate BETWEEN :startDate AND :endDate")
    double sumRevenue(@Param("startDate") LocalDateTime startDate,
                      @Param("endDate") LocalDateTime endDate);

    // Thống kê top phim bán vé (trả về Object[] = {movieId, movieTitle, posterUrl, ticketCount, revenue})
    @Query("SELECT m.id, m.title, m.images, COUNT(t.id), COALESCE(SUM(b.totalAmount), 0) " +
           "FROM Booking b " +
           "JOIN b.showtime s " +
           "JOIN s.movie m " +
           "JOIN b.tickets t " +
           "WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.id, m.title, m.images " +
           "ORDER BY COUNT(t.id) DESC")
    List<Object[]> findTopMoviesByTicketCount(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    // Thống kê xu hướng bán vé theo ngày
    @Query("SELECT FUNCTION('DAY', b.bookingDate), COUNT(t.id), COALESCE(SUM(b.totalAmount), 0) " +
           "FROM Booking b " +
           "JOIN b.tickets t " +
           "WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('DAY', b.bookingDate) " +
           "ORDER BY FUNCTION('DAY', b.bookingDate)")
    List<Object[]> findTicketTrendByDay(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);

    // Thống kê xu hướng bán vé theo tháng
    @Query("SELECT FUNCTION('MONTH', b.bookingDate), COUNT(t.id), COALESCE(SUM(b.totalAmount), 0) " +
           "FROM Booking b " +
           "JOIN b.tickets t " +
           "WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate BETWEEN :startDate AND :endDate " +
           "GROUP BY FUNCTION('MONTH', b.bookingDate) " +
           "ORDER BY FUNCTION('MONTH', b.bookingDate)")
    List<Object[]> findTicketTrendByMonth(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    // Lấy danh sách booking theo khoảng thời gian (phân trang)
    List<Booking> findByBookingDateBetweenOrderByBookingDateDesc(
        LocalDateTime startDate, LocalDateTime endDate);

    // Lọc theo trạng thái
    List<Booking> findByStatusAndBookingDateBetweenOrderByBookingDateDesc(
        BookingStatus status, LocalDateTime startDate, LocalDateTime endDate);
}
```

---

## Step 10: Tạo TicketRepository (nếu chưa có)

> **Mục đích**: Tạo repository cho entity Ticket để hỗ trợ thống kê.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/repository/TicketRepository.java`

### 🔧 Hướng dẫn:

```java
package org.example.backend.repository;

import org.example.backend.entity.Ticket;
import org.example.backend.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Lấy danh sách vé theo booking
    List<Ticket> findByBookingId(Long bookingId);

    // Lấy danh sách vé theo khách hàng
    List<Ticket> findByCustomerIdOrderByIssuedAtDesc(Long customerId);

    // Đếm vé theo trạng thái
    long countByStatus(TicketStatus status);
}
```

---

## Step 11: Tạo Service — BookingAdminService

> **Mục đích**: Xử lý business logic thống kê booking cho admin.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/service/BookingAdminService.java`

### 🔧 Hướng dẫn:

```java
@Service
public class BookingAdminService {

    private final BookingRepository bookingRepository;

    // Constructor injection...

    // 1. Lấy thống kê tổng quan
    public BookingOverviewResponse getOverview(String filterType, int year, Integer month, Integer quarter) {
        // Tính startDate, endDate dựa trên filterType
        // filterType = "MONTH" → startDate = đầu tháng, endDate = cuối tháng
        // filterType = "QUARTER" → startDate = đầu quý, endDate = cuối quý
        // filterType = "YEAR" → startDate = 01/01/year, endDate = 31/12/year

        LocalDateTime startDate = calculateStartDate(filterType, year, month, quarter);
        LocalDateTime endDate = calculateEndDate(filterType, year, month, quarter);

        long totalTickets = bookingRepository.countTicketsSold(startDate, endDate);
        double totalRevenue = bookingRepository.sumRevenue(startDate, endDate);
        // fillRate cần tính dựa trên tổng ghế available vs ghế đã bán (optional)

        return BookingOverviewResponse.builder()
            .totalTicketsSold(totalTickets)
            .totalRevenue(totalRevenue)
            .fillRate(calculateFillRate(startDate, endDate))
            .filterType(filterType)
            .year(year)
            .month(month)
            .quarter(quarter)
            .build();
    }

    // 2. Lấy top phim bán vé
    public List<MovieTicketStatsResponse> getTopMovies(
            String filterType, int year, Integer month, Integer quarter, int limit) {
        LocalDateTime startDate = calculateStartDate(filterType, year, month, quarter);
        LocalDateTime endDate = calculateEndDate(filterType, year, month, quarter);

        List<Object[]> results = bookingRepository.findTopMoviesByTicketCount(startDate, endDate);

        return results.stream()
            .limit(limit)
            .map(row -> MovieTicketStatsResponse.builder()
                .movieId((Long) row[0])
                .movieTitle((String) row[1])
                .posterUrl((String) row[2])
                .ticketCount((Long) row[3])
                .revenue((Double) row[4])
                .build())
            .toList();
    }

    // 3. Lấy xu hướng bán vé
    public List<TicketTrendResponse> getTicketTrend(
            String filterType, int year, Integer month, Integer quarter) {
        LocalDateTime startDate = calculateStartDate(filterType, year, month, quarter);
        LocalDateTime endDate = calculateEndDate(filterType, year, month, quarter);

        List<Object[]> results;
        if ("MONTH".equals(filterType)) {
            results = bookingRepository.findTicketTrendByDay(startDate, endDate);
            // Map: day → label "01", "02", ...
        } else {
            results = bookingRepository.findTicketTrendByMonth(startDate, endDate);
            // Map: month → label "T1", "T2", ...
        }

        return results.stream()
            .map(row -> TicketTrendResponse.builder()
                .label(formatLabel(row[0], filterType))
                .ticketCount(((Number) row[1]).longValue())
                .revenue(((Number) row[2]).doubleValue())
                .build())
            .toList();
    }

    // 4. Lấy danh sách booking chi tiết
    public List<BookingDetailResponse> getAllBookings(
            String filterType, int year, Integer month, Integer quarter,
            BookingStatus status) {
        LocalDateTime startDate = calculateStartDate(filterType, year, month, quarter);
        LocalDateTime endDate = calculateEndDate(filterType, year, month, quarter);

        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository
                .findByStatusAndBookingDateBetweenOrderByBookingDateDesc(status, startDate, endDate);
        } else {
            bookings = bookingRepository
                .findByBookingDateBetweenOrderByBookingDateDesc(startDate, endDate);
        }

        return bookings.stream()
            .map(this::mapToDetailResponse)
            .toList();
    }

    // === Helper methods ===

    private BookingDetailResponse mapToDetailResponse(Booking booking) {
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Cinema cinema = showtime.getCinema();
        Room room = showtime.getRoom();

        List<String> seatLabels = booking.getTickets().stream()
            .map(t -> t.getSeat().getRowLabel() + t.getSeat().getColumnNumber())
            .toList();

        return BookingDetailResponse.builder()
            .bookingId(booking.getId())
            .customerName(booking.getCustomer().getFullName())
            .customerEmail(booking.getCustomer().getEmail())
            .movieTitle(movie.getTitle())
            .cinemaName(cinema.getName())
            .roomName(room.getName())
            .showtime(formatTime(showtime.getStartTime()) + " - " + formatTime(showtime.getEndTime()))
            .showDate(formatDate(showtime.getStartTime()))
            .ticketCount(booking.getTickets().size())
            .totalAmount(booking.getTotalAmount())
            .status(booking.getStatus().name())
            .bookingDate(formatDateTime(booking.getBookingDate()))
            .seatLabels(seatLabels)
            .build();
    }

    private LocalDateTime calculateStartDate(String filterType, int year, Integer month, Integer quarter) {
        return switch (filterType) {
            case "MONTH" -> LocalDateTime.of(year, month, 1, 0, 0);
            case "QUARTER" -> {
                int startMonth = (quarter - 1) * 3 + 1;
                yield LocalDateTime.of(year, startMonth, 1, 0, 0);
            }
            case "YEAR" -> LocalDateTime.of(year, 1, 1, 0, 0);
            default -> throw new IllegalArgumentException("Invalid filterType: " + filterType);
        };
    }

    private LocalDateTime calculateEndDate(String filterType, int year, Integer month, Integer quarter) {
        return switch (filterType) {
            case "MONTH" -> LocalDateTime.of(year, month, 1, 0, 0)
                .plusMonths(1).minusSeconds(1);
            case "QUARTER" -> {
                int endMonth = quarter * 3;
                yield LocalDateTime.of(year, endMonth, 1, 0, 0)
                    .plusMonths(1).minusSeconds(1);
            }
            case "YEAR" -> LocalDateTime.of(year, 12, 31, 23, 59, 59);
            default -> throw new IllegalArgumentException("Invalid filterType: " + filterType);
        };
    }
}
```

---

## Step 12: Tạo Controller — BookingAdminController

> **Mục đích**: Expose API endpoint cho frontend admin gọi.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/controller/BookingAdminController.java`

### 🔧 Hướng dẫn:

```java
@RestController
@RequestMapping("/api/admin/bookings")
public class BookingAdminController {

    private final BookingAdminService bookingAdminService;

    // Constructor injection...

    // GET /api/admin/bookings/overview?filterType=MONTH&year=2026&month=6
    @GetMapping("/overview")
    public ResponseEntity<BookingOverviewResponse> getOverview(
            @RequestParam String filterType,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        return ResponseEntity.ok(bookingAdminService.getOverview(filterType, year, month, quarter));
    }

    // GET /api/admin/bookings/stats/by-movie?filterType=MONTH&year=2026&month=6&limit=10
    @GetMapping("/stats/by-movie")
    public ResponseEntity<List<MovieTicketStatsResponse>> getTopMovies(
            @RequestParam String filterType,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(bookingAdminService.getTopMovies(filterType, year, month, quarter, limit));
    }

    // GET /api/admin/bookings/stats/trend?filterType=MONTH&year=2026&month=6
    @GetMapping("/stats/trend")
    public ResponseEntity<List<TicketTrendResponse>> getTicketTrend(
            @RequestParam String filterType,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter) {
        return ResponseEntity.ok(bookingAdminService.getTicketTrend(filterType, year, month, quarter));
    }

    // GET /api/admin/bookings?filterType=MONTH&year=2026&month=6&status=CONFIRMED
    @GetMapping
    public ResponseEntity<List<BookingDetailResponse>> getAllBookings(
            @RequestParam String filterType,
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer quarter,
            @RequestParam(required = false) String status) {
        BookingStatus bookingStatus = status != null ? BookingStatus.valueOf(status) : null;
        return ResponseEntity.ok(
            bookingAdminService.getAllBookings(filterType, year, month, quarter, bookingStatus));
    }
}
```

---

## Step 13: Cập nhật SecurityConfig — Cho phép endpoint `/api/admin/bookings/**`

> **Mục đích**: Đảm bảo endpoint thống kê chỉ admin mới truy cập được.

### 📁 Files cần sửa:
- `backend/src/main/java/org/example/backend/config/SecurityConfig.java`

### 🔧 Hướng dẫn:

Kiểm tra đã có rule `/api/admin/**` chưa:
```java
.requestMatchers("/api/admin/**").hasAuthority("ADMIN")
```
Nếu đã có (từ checklist khuyến mãi) thì **không cần sửa gì thêm**.

---

---

# 🧪 PHẦN 1.3: KIỂM THỬ ADMIN

---

## Step 14: Test API bằng Postman/Thunder Client

> **Mục đích**: Test toàn bộ API thống kê trước khi kết nối frontend.

### 🔧 Checklist test:

- [ ] `POST /api/auth/login` — Login với tài khoản ADMIN → Lấy token
- [ ] `GET /api/admin/bookings/overview?filterType=MONTH&year=2026&month=6` → Trả về tổng vé, doanh thu, fillRate
- [ ] `GET /api/admin/bookings/overview?filterType=QUARTER&year=2026&quarter=2` → Trả về thống kê Q2/2026
- [ ] `GET /api/admin/bookings/overview?filterType=YEAR&year=2026` → Trả về thống kê cả năm
- [ ] `GET /api/admin/bookings/stats/by-movie?filterType=MONTH&year=2026&month=6&limit=10` → Trả về top 10 phim
- [ ] `GET /api/admin/bookings/stats/trend?filterType=MONTH&year=2026&month=6` → Trả về trend theo ngày
- [ ] `GET /api/admin/bookings/stats/trend?filterType=YEAR&year=2026` → Trả về trend theo tháng
- [ ] `GET /api/admin/bookings?filterType=MONTH&year=2026&month=6` → Trả về danh sách booking
- [ ] `GET /api/admin/bookings?filterType=MONTH&year=2026&month=6&status=CONFIRMED` → Lọc theo status
- [ ] Thử gọi API với token CUSTOMER → Phải bị 403 Forbidden

---

## Step 15: Kết nối Frontend ↔ Backend & Test toàn bộ luồng Admin

> **Mục đích**: Chạy full flow từ UI admin.

### 🔧 Checklist test:

- [ ] Login admin → Mở sidebar → Click "Quản lý Đặt Vé" → Navigate tới `/admin/bookings`
- [ ] Summary Cards hiển thị đúng số liệu (tổng vé, doanh thu, tỷ lệ lấp đầy)
- [ ] Thay đổi bộ lọc "Tháng" → "Quý" → "Năm" → Số liệu thay đổi tương ứng
- [ ] Chọn tháng khác → Biểu đồ & cards cập nhật lại
- [ ] Bar Chart hiển thị top phim, thanh bar có gradient, hover hiện tooltip
- [ ] Line Chart hiển thị xu hướng bán vé, responsive
- [ ] Bảng chi tiết hiển thị danh sách booking, có phân trang
- [ ] Badge trạng thái hiển thị đúng màu (PENDING vàng, CONFIRMED xanh, v.v.)
- [ ] Responsive: trang hiển thị đẹp trên mobile, tablet, desktop

---

---

# 👤 PHASE 2: USER (CUSTOMER) — Xem lại vé đã đặt

---

# 🖥️ PHẦN 2.1: FRONTEND (React + Vite)

---

## Step 16: Tạo Service gọi API vé của User

> **Mục đích**: Tạo file service cho user xem vé đã đặt.

### 📁 Files cần tạo:
- `frontend/src/services/bookingUserService.js`

### 🔧 Hướng dẫn:

```js
import api from "../api/axiosConfig";

// Lấy danh sách vé đã đặt của user đang đăng nhập
export const getMyBookings = () =>
  api.get("/customer/bookings/my");

// Lấy chi tiết 1 booking
export const getBookingDetail = (bookingId) =>
  api.get(`/customer/bookings/${bookingId}`);
```

---

## Step 17: Tạo trang Vé của tôi (MyTicketsPage)

> **Mục đích**: Trang hiển thị danh sách vé user đã đặt, với đầy đủ thông tin.

### 📁 Files cần tạo:
- `frontend/src/pages/MyTicketsPage/MyTicketsPage.jsx`
- `frontend/src/pages/MyTicketsPage/MyTicketsPage.css`

### 🔧 Hướng dẫn:

**17.1. Cấu trúc trang:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🎬 Vé của tôi                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌── Bộ lọc ──────────────────────────────────────────────────┐ │
│  │  [Tất cả ▼]  [Sắp chiếu ▼]  [Đã xem ▼]                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌── Ticket Card 1 ──────────────────────────────────────────┐  │
│  │  ┌────────┐                                               │  │
│  │  │ Poster │  🎬 Avengers: Endgame                         │  │
│  │  │        │  📅 24/06/2026 • 14:30 - 17:15                │  │
│  │  │        │  🏢 Galaxy Nguyễn Du • Phòng 3                │  │
│  │  │        │  💺 Ghế: A1, A2, A3                           │  │
│  │  │        │  🎫 Trạng thái: ✅ Đã xác nhận                │  │
│  │  └────────┘  💰 Tổng: 450,000 VNĐ                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌── Ticket Card 2 ──────────────────────────────────────────┐  │
│  │  ┌────────┐                                               │  │
│  │  │ Poster │  🎬 Spider-Man: No Way Home                   │  │
│  │  │        │  📅 20/06/2026 • 19:00 - 21:30                │  │
│  │  │        │  🏢 CGV Vincom • Phòng 7                      │  │
│  │  │        │  💺 Ghế: D5, D6                               │  │
│  │  │        │  🎫 Trạng thái: ✅ Đã sử dụng                 │  │
│  │  └────────┘  💰 Tổng: 300,000 VNĐ                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  (Không có vé nào? → Hiển thị Empty State)                      │
└─────────────────────────────────────────────────────────────────┘
```

**17.2. Thông tin hiển thị trên mỗi Ticket Card:**

| Trường | Nguồn dữ liệu | Ví dụ |
|--------|---------------|-------|
| Tên phim | `booking.showtime.movie.title` | Avengers: Endgame |
| Poster phim | `booking.showtime.movie.images` | (hình ảnh) |
| Ngày chiếu | `booking.showtime.startTime` (format ngày) | 24/06/2026 |
| Giờ chiếu | `booking.showtime.startTime` - `endTime` | 14:30 - 17:15 |
| Tên rạp | `booking.showtime.cinema.name` | Galaxy Nguyễn Du |
| Số phòng | `booking.showtime.room.name` | Phòng 3 |
| Ghế đã đặt | `booking.tickets[].seat.rowLabel + columnNumber` | A1, A2, A3 |
| Trạng thái | `booking.status` | CONFIRMED |
| Tổng tiền | `booking.totalAmount` | 450,000 VNĐ |

**17.3. Bộ lọc/Tab:**
- **Tất cả**: Hiển thị mọi booking
- **Sắp chiếu**: `showtime.startTime > now()` và `status = CONFIRMED`
- **Đã xem**: `showtime.startTime < now()` hoặc `ticket.status = USED`
- **Đã huỷ**: `status = CANCELLED`

**17.4. Empty State:**
- Khi user chưa đặt vé nào → Hiển thị illustration + text "Bạn chưa đặt vé nào. Hãy khám phá phim mới!" + nút "Xem phim" → link tới trang chủ

**17.5. Thiết kế Ticket Card:**
- Background gradient nhẹ (cinema theme: dark)
- Poster phim bên trái (thumbnail nhỏ)
- Thông tin bên phải, layout flex
- Border-left color theo trạng thái (xanh=confirmed, đỏ=cancelled, vàng=pending)
- Hover effect: scale nhẹ + shadow
- Responsive: trên mobile poster ẩn hoặc nhỏ lại

---

## Step 18: Tạo Component TicketCard

> **Mục đích**: Component tái sử dụng hiển thị 1 vé đã đặt.

### 📁 Files cần tạo:
- `frontend/src/components/ticket/TicketCard.jsx`
- `frontend/src/components/ticket/TicketCard.css`

### 🔧 Hướng dẫn:

```jsx
// Props: { booking }
// booking = {
//   bookingId, movieTitle, posterUrl, showDate, showtime,
//   cinemaName, roomName, seatLabels, status, totalAmount
// }

// Component structure:
// <div className="ticket-card" data-status={status}>
//   <div className="ticket-poster">
//     <img src={posterUrl} alt={movieTitle} />
//   </div>
//   <div className="ticket-info">
//     <h3 className="ticket-movie-title">{movieTitle}</h3>
//     <div className="ticket-detail-row">
//       <span className="ticket-icon">📅</span>
//       <span>{showDate} • {showtime}</span>
//     </div>
//     <div className="ticket-detail-row">
//       <span className="ticket-icon">🏢</span>
//       <span>{cinemaName} • {roomName}</span>
//     </div>
//     <div className="ticket-detail-row">
//       <span className="ticket-icon">💺</span>
//       <span>Ghế: {seatLabels.join(", ")}</span>
//     </div>
//     <div className="ticket-footer">
//       <StatusBadge status={status} />
//       <span className="ticket-total">{formatCurrency(totalAmount)}</span>
//     </div>
//   </div>
// </div>
```

---

## Step 19: Cập nhật Route & Navigation cho User

> **Mục đích**: Thêm route `/my-tickets` và link trong navigation bar cho customer.

### 📁 Files cần sửa:
- `frontend/src/routes/AppRoutes.jsx` — Thêm route `/my-tickets`
- `frontend/src/components/layout/Navbar.jsx` (hoặc tương đương) — Thêm link "Vé của tôi" vào navbar

### 🔧 Hướng dẫn:

**19.1. Thêm route:**
```jsx
import MyTicketsPage from "../pages/MyTicketsPage/MyTicketsPage";

// Trong group route customer (cần đăng nhập):
<Route path="/my-tickets" element={<MyTicketsPage />} />
```

**19.2. Thêm link vào Navbar:**
```jsx
// Chỉ hiển thị khi user đã đăng nhập (role = CUSTOMER)
{user && (
  <NavLink to="/my-tickets" className="nav-link">
    🎫 Vé của tôi
  </NavLink>
)}
```

---

---

# ⚙️ PHẦN 2.2: BACKEND (Spring Boot + JPA)

---

## Step 20: Tạo DTO Response cho User Booking

> **Mục đích**: Tạo DTO trả về thông tin booking cho user xem.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/dto/response/MyBookingResponse.java`

### 🔧 Hướng dẫn:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyBookingResponse {
    private Long bookingId;
    private String movieTitle;           // Tên phim
    private String posterUrl;            // Poster phim
    private String showDate;             // Ngày chiếu: "24/06/2026"
    private String showtime;             // Giờ chiếu: "14:30 - 17:15"
    private String cinemaName;           // Tên rạp: "Galaxy Nguyễn Du"
    private String roomName;             // Phòng chiếu: "Phòng 3"
    private List<String> seatLabels;     // Ghế đã đặt: ["A1", "A2", "A3"]
    private String status;               // PENDING, CONFIRMED, CANCELLED, EXPIRED
    private double totalAmount;          // Tổng tiền
    private String bookingDate;          // Ngày đặt: "24/06/2026 08:30"
    private int ticketCount;             // Số lượng vé
}
```

---

## Step 21: Tạo Service — BookingUserService

> **Mục đích**: Xử lý business logic cho user xem vé.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/service/BookingUserService.java`

### 🔧 Hướng dẫn:

```java
@Service
public class BookingUserService {

    private final BookingRepository bookingRepository;

    // Constructor injection...

    // Lấy danh sách booking của user đang đăng nhập
    public List<MyBookingResponse> getMyBookings(Long customerId) {
        List<Booking> bookings = bookingRepository
            .findByCustomerIdOrderByBookingDateDesc(customerId);

        return bookings.stream()
            .map(this::mapToMyBookingResponse)
            .toList();
    }

    // Lấy chi tiết 1 booking (kiểm tra quyền sở hữu)
    public MyBookingResponse getBookingDetail(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        // Kiểm tra booking có thuộc về user này không
        if (!booking.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xem booking này");
        }

        return mapToMyBookingResponse(booking);
    }

    private MyBookingResponse mapToMyBookingResponse(Booking booking) {
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Cinema cinema = showtime.getCinema();
        Room room = showtime.getRoom();

        List<String> seatLabels = booking.getTickets().stream()
            .map(t -> t.getSeat().getRowLabel() + t.getSeat().getColumnNumber())
            .sorted()
            .toList();

        return MyBookingResponse.builder()
            .bookingId(booking.getId())
            .movieTitle(movie.getTitle())
            .posterUrl(movie.getImages())
            .showDate(formatDate(showtime.getStartTime()))
            .showtime(formatTime(showtime.getStartTime()) + " - " + formatTime(showtime.getEndTime()))
            .cinemaName(cinema.getName())
            .roomName(room.getName())
            .seatLabels(seatLabels)
            .status(booking.getStatus().name())
            .totalAmount(booking.getTotalAmount())
            .bookingDate(formatDateTime(booking.getBookingDate()))
            .ticketCount(booking.getTickets().size())
            .build();
    }
}
```

> ⚠️ **Lưu ý**: Cần thêm method `findByCustomerIdOrderByBookingDateDesc` vào `BookingRepository`:
> ```java
> List<Booking> findByCustomerIdOrderByBookingDateDesc(Long customerId);
> ```

---

## Step 22: Tạo Controller — BookingUserController

> **Mục đích**: Expose API endpoint cho user xem vé đã đặt.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/controller/BookingUserController.java`

### 🔧 Hướng dẫn:

```java
@RestController
@RequestMapping("/api/customer/bookings")
public class BookingUserController {

    private final BookingUserService bookingUserService;

    // Constructor injection...

    // GET /api/customer/bookings/my
    @GetMapping("/my")
    public ResponseEntity<List<MyBookingResponse>> getMyBookings(Authentication authentication) {
        // Lấy customerId từ JWT token (authentication principal)
        Long customerId = extractCustomerId(authentication);
        return ResponseEntity.ok(bookingUserService.getMyBookings(customerId));
    }

    // GET /api/customer/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MyBookingResponse> getBookingDetail(
            @PathVariable Long id,
            Authentication authentication) {
        Long customerId = extractCustomerId(authentication);
        return ResponseEntity.ok(bookingUserService.getBookingDetail(id, customerId));
    }

    private Long extractCustomerId(Authentication authentication) {
        // Tuỳ cách implement JWT:
        // - Nếu dùng UserDetails: ((CustomUserDetails) authentication.getPrincipal()).getId()
        // - Nếu dùng email: tìm customer từ email trong token
        String email = authentication.getName();
        // return customerRepository.findByEmail(email).getId();
        // (Inject CustomerRepository hoặc dùng service)
    }
}
```

---

## Step 23: Cập nhật SecurityConfig — Cho phép endpoint `/api/customer/**`

> **Mục đích**: Đảm bảo endpoint vé của user yêu cầu đăng nhập.

### 📁 Files cần sửa:
- `backend/src/main/java/org/example/backend/config/SecurityConfig.java`

### 🔧 Hướng dẫn:

Thêm vào phần `authorizeHttpRequests`:
```java
.requestMatchers("/api/customer/**").hasAuthority("CUSTOMER")
```

> ⚠️ Nếu muốn cả ADMIN cũng xem được (test): `.hasAnyAuthority("CUSTOMER", "ADMIN")`

---

---

# 🧪 PHẦN 2.3: KIỂM THỬ USER

---

## Step 24: Test API bằng Postman/Thunder Client

> **Mục đích**: Test API vé của user trước khi kết nối frontend.

### 🔧 Checklist test:

- [ ] `POST /api/auth/login` — Login với tài khoản CUSTOMER → Lấy token
- [ ] `GET /api/customer/bookings/my` — Trả về danh sách booking của user
- [ ] Kiểm tra response chứa đầy đủ: movieTitle, showDate, showtime, cinemaName, roomName, seatLabels
- [ ] `GET /api/customer/bookings/{id}` — Trả về chi tiết 1 booking
- [ ] Thử xem booking của người khác → Phải bị 403 hoặc lỗi "Không có quyền"
- [ ] Thử gọi API không có token → Phải bị 401 Unauthorized
- [ ] Thử gọi API `/api/admin/bookings/**` với token CUSTOMER → Phải bị 403

---

## Step 25: Kết nối Frontend ↔ Backend & Test toàn bộ luồng User

> **Mục đích**: Chạy full flow từ UI user.

### 🔧 Checklist test:

- [ ] Login customer → Navbar hiển thị link "Vé của tôi"
- [ ] Click "Vé của tôi" → Navigate tới `/my-tickets`
- [ ] Danh sách vé hiển thị với đầy đủ thông tin (tên phim, poster, giờ chiếu, rạp, phòng, ghế)
- [ ] Tab "Tất cả" hiển thị mọi booking
- [ ] Tab "Sắp chiếu" chỉ hiển thị booking có showtime trong tương lai
- [ ] Tab "Đã xem" hiển thị booking đã qua
- [ ] Tab "Đã huỷ" hiển thị booking cancelled
- [ ] Empty state hiển thị khi không có vé
- [ ] Ticket card responsive: hiển thị đẹp trên mobile
- [ ] Badge trạng thái đúng màu
- [ ] Format tiền VNĐ đúng (có dấu phẩy phân cách)

---

---

# 📊 Tóm tắt Files cần tạo/sửa

---

## PHASE 1: ADMIN

### Frontend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `services/bookingAdminService.js` | Gọi API thống kê |
| 2 | `pages/Admin/BookingManagementPage.jsx` + `.css` | Trang dashboard thống kê |
| 3 | `components/booking/BookingSummaryCards.jsx` + `.css` | Thẻ tổng quan |
| 4 | `components/booking/MovieTicketChart.jsx` + `.css` | Biểu đồ top phim |
| 5 | `components/booking/TicketTrendChart.jsx` + `.css` | Biểu đồ xu hướng |

### Frontend (Sửa):
| # | File | Thay đổi |
|---|------|----------|
| 1 | `components/layout/AdminSidebar.jsx` | Thêm icon + link "Quản lý Đặt Vé" |
| 2 | `routes/AppRoutes.jsx` | Thêm route `/admin/bookings` |

### Backend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `dto/response/BookingOverviewResponse.java` | DTO thống kê tổng quan |
| 2 | `dto/response/MovieTicketStatsResponse.java` | DTO thống kê theo phim |
| 3 | `dto/response/TicketTrendResponse.java` | DTO xu hướng bán vé |
| 4 | `dto/response/BookingDetailResponse.java` | DTO chi tiết booking |
| 5 | `repository/BookingRepository.java` | JPA Repository + custom query |
| 6 | `repository/TicketRepository.java` | JPA Repository cho Ticket |
| 7 | `service/BookingAdminService.java` | Business logic thống kê |
| 8 | `controller/BookingAdminController.java` | REST Controller admin |

---

## PHASE 2: USER

### Frontend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `services/bookingUserService.js` | Gọi API vé của user |
| 2 | `pages/MyTicketsPage/MyTicketsPage.jsx` + `.css` | Trang "Vé của tôi" |
| 3 | `components/ticket/TicketCard.jsx` + `.css` | Card hiển thị vé |

### Frontend (Sửa):
| # | File | Thay đổi |
|---|------|----------|
| 1 | `routes/AppRoutes.jsx` | Thêm route `/my-tickets` |
| 2 | `components/layout/Navbar.jsx` | Thêm link "Vé của tôi" |

### Backend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `dto/response/MyBookingResponse.java` | DTO vé của user |
| 2 | `service/BookingUserService.java` | Business logic xem vé |
| 3 | `controller/BookingUserController.java` | REST Controller user |

### Backend (Sửa):
| # | File | Thay đổi |
|---|------|----------|
| 1 | `repository/BookingRepository.java` | Thêm method `findByCustomerIdOrderByBookingDateDesc` |
| 2 | `config/SecurityConfig.java` | Thêm rule `/api/customer/**` |

---

## 📦 Dependencies cần cài thêm (Frontend):

```bash
# Thư viện biểu đồ (chọn 1 trong 2):
npm install recharts
# hoặc
npm install chart.js react-chartjs-2
```
