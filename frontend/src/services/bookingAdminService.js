/**
 * Mock data service cho Admin Booking Management
 * Sẽ thay bằng API thật khi backend hoàn tất
 */

// ============================================
// Mock Data
// ============================================

const MOCK_MOVIES = [
  "Avengers: Endgame",
  "Spider-Man: No Way Home",
  "Lật Mặt 8: Đối Diện",
  "Doraemon: Nobita và Bản Giao Hưởng",
  "Inside Out 2",
  "Mai",
  "The Batman",
  "Dune: Part Two",
  "Kung Fu Panda 4",
  "Godzilla x Kong",
];

const MOCK_CINEMAS = [
  "Galaxy Nguyễn Du",
  "CGV Vincom Đồng Khởi",
  "Lotte Cinema Quận 7",
  "BHD Star Phạm Hùng",
  "Mega GS Cao Thắng",
];

const MOCK_ROOMS = ["Phòng 1", "Phòng 2", "Phòng 3", "Phòng 4", "Phòng 5", "Phòng 6", "Phòng 7"];

const MOCK_CUSTOMERS = [
  { name: "Nguyễn Văn Huy", email: "huy@gmail.com" },
  { name: "Trần Thị Mai", email: "mai@gmail.com" },
  { name: "Lê Hoàng Nam", email: "nam@gmail.com" },
  { name: "Phạm Minh Tuấn", email: "tuan@gmail.com" },
  { name: "Đặng Thị Hồng", email: "hong@gmail.com" },
  { name: "Võ Quốc Bảo", email: "bao@gmail.com" },
  { name: "Bùi Thanh Hà", email: "ha@gmail.com" },
  { name: "Ngô Đức Anh", email: "anh@gmail.com" },
];

const STATUSES = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSeatLabels(count) {
  const rows = "ABCDEFGHIJ";
  const seats = [];
  const row = rows[randomInt(0, 9)];
  const startCol = randomInt(1, 12 - count);
  for (let i = 0; i < count; i++) {
    seats.push(`${row}${startCol + i}`);
  }
  return seats;
}

// ============================================
// Generate month/quarter/year dependent data
// ============================================

function getDateRange(filterType, year, month, quarter) {
  let startMonth, endMonth;
  if (filterType === "MONTH") {
    startMonth = month;
    endMonth = month;
  } else if (filterType === "QUARTER") {
    startMonth = (quarter - 1) * 3 + 1;
    endMonth = quarter * 3;
  } else {
    startMonth = 1;
    endMonth = 12;
  }
  return { startMonth, endMonth };
}

// ============================================
// Mock API Functions
// ============================================

export const getBookingOverview = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { filterType, year } = params;
      // Generate different numbers based on filter to make it look real
      const seed = (year || 2026) + (params.month || 0) + (params.quarter || 0);
      const base = filterType === "YEAR" ? 12500 : filterType === "QUARTER" ? 3800 : 1245;

      resolve({
        data: {
          totalTicketsSold: base + (seed % 500),
          totalRevenue: (base * 150000) + (seed % 100) * 50000,
          fillRate: 65 + (seed % 25),
          filterType,
          year: year || 2026,
          month: params.month || null,
          quarter: params.quarter || null,
        },
      });
    }, 400);
  });
};

export const getBookingsByMovie = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const limit = params.limit || 10;
      const data = MOCK_MOVIES.slice(0, limit).map((title, index) => ({
        movieId: index + 1,
        movieTitle: title,
        posterUrl: null,
        ticketCount: Math.max(50, 500 - index * 45 + randomInt(-20, 20)),
        revenue: Math.max(7500000, (500 - index * 45) * 150000),
      }));

      resolve({ data });
    }, 500);
  });
};

export const getBookingTrend = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { filterType } = params;
      let data = [];

      if (filterType === "MONTH") {
        const daysInMonth = 30;
        for (let d = 1; d <= daysInMonth; d++) {
          data.push({
            label: String(d).padStart(2, "0"),
            ticketCount: randomInt(20, 80),
            revenue: randomInt(3000000, 12000000),
          });
        }
      } else if (filterType === "QUARTER") {
        const { startMonth } = getDateRange("QUARTER", params.year, null, params.quarter);
        for (let m = 0; m < 3; m++) {
          data.push({
            label: `Tháng ${startMonth + m}`,
            ticketCount: randomInt(800, 1600),
            revenue: randomInt(120000000, 240000000),
          });
        }
      } else {
        for (let m = 1; m <= 12; m++) {
          data.push({
            label: `T${m}`,
            ticketCount: randomInt(600, 1500),
            revenue: randomInt(90000000, 225000000),
          });
        }
      }

      resolve({ data });
    }, 500);
  });
};

export const getAllBookings = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bookings = [];
      const count = 25;

      for (let i = 0; i < count; i++) {
        const ticketCount = randomInt(1, 5);
        const customer = randomItem(MOCK_CUSTOMERS);
        const status = randomItem(STATUSES);
        const movie = randomItem(MOCK_MOVIES);
        const cinema = randomItem(MOCK_CINEMAS);
        const room = randomItem(MOCK_ROOMS);
        const day = randomInt(1, 28);
        const hour = randomInt(8, 22);
        const minute = randomInt(0, 1) * 30;
        const year = params.year || 2026;
        const month = params.month || 6;

        bookings.push({
          bookingId: 1000 + i,
          customerName: customer.name,
          customerEmail: customer.email,
          movieTitle: movie,
          cinemaName: cinema,
          roomName: room,
          showtime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} - ${String(hour + 2).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          showDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`,
          ticketCount,
          totalAmount: ticketCount * 95000,
          status,
          bookingDate: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} ${String(hour - 1).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
          seatLabels: generateSeatLabels(ticketCount),
        });
      }

      // Filter by status if specified
      const filtered = params.status
        ? bookings.filter((b) => b.status === params.status)
        : bookings;

      resolve({ data: filtered });
    }, 400);
  });
};
