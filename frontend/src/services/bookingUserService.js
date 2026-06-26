/**
 * Mock data service cho User Booking (Vé của tôi)
 * Sẽ thay bằng API thật khi backend hoàn tất
 */

const MOCK_MY_BOOKINGS = [
  {
    bookingId: 1001,
    movieTitle: "Avengers: Endgame",
    posterUrl: "https://image.tmdb.org/t/p/w300/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    showDate: "28/06/2026",
    showtime: "14:30 - 17:15",
    cinemaName: "Galaxy Nguyễn Du",
    roomName: "Phòng 3",
    seatLabels: ["A1", "A2", "A3"],
    status: "CONFIRMED",
    totalAmount: 285000,
    bookingDate: "24/06/2026 08:30",
    ticketCount: 3,
  },
  {
    bookingId: 1002,
    movieTitle: "Spider-Man: No Way Home",
    posterUrl: "https://image.tmdb.org/t/p/w300/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    showDate: "25/06/2026",
    showtime: "19:00 - 21:30",
    cinemaName: "CGV Vincom Đồng Khởi",
    roomName: "Phòng 7",
    seatLabels: ["D5", "D6"],
    status: "CONFIRMED",
    totalAmount: 190000,
    bookingDate: "22/06/2026 15:45",
    ticketCount: 2,
  },
  {
    bookingId: 1003,
    movieTitle: "Lật Mặt 8: Đối Diện",
    posterUrl: "https://image.tmdb.org/t/p/w300/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
    showDate: "20/06/2026",
    showtime: "20:00 - 22:15",
    cinemaName: "Lotte Cinema Quận 7",
    roomName: "Phòng 2",
    seatLabels: ["F3"],
    status: "USED",
    totalAmount: 95000,
    bookingDate: "18/06/2026 10:20",
    ticketCount: 1,
  },
  {
    bookingId: 1004,
    movieTitle: "Inside Out 2",
    posterUrl: "https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    showDate: "15/06/2026",
    showtime: "10:00 - 12:00",
    cinemaName: "BHD Star Phạm Hùng",
    roomName: "Phòng 5",
    seatLabels: ["B7", "B8", "B9", "B10"],
    status: "USED",
    totalAmount: 380000,
    bookingDate: "13/06/2026 09:15",
    ticketCount: 4,
  },
  {
    bookingId: 1005,
    movieTitle: "Dune: Part Two",
    posterUrl: "https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nez7S.jpg",
    showDate: "10/06/2026",
    showtime: "16:45 - 19:30",
    cinemaName: "Mega GS Cao Thắng",
    roomName: "Phòng 1",
    seatLabels: ["C2", "C3"],
    status: "CANCELLED",
    totalAmount: 190000,
    bookingDate: "08/06/2026 14:30",
    ticketCount: 2,
  },
  {
    bookingId: 1006,
    movieTitle: "Mai",
    posterUrl: "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDhRkCCMsl4XWFZ.jpg",
    showDate: "05/06/2026",
    showtime: "13:00 - 15:15",
    cinemaName: "Galaxy Nguyễn Du",
    roomName: "Phòng 4",
    seatLabels: ["E1", "E2"],
    status: "USED",
    totalAmount: 190000,
    bookingDate: "03/06/2026 11:00",
    ticketCount: 2,
  },
  {
    bookingId: 1007,
    movieTitle: "Kung Fu Panda 4",
    posterUrl: "https://image.tmdb.org/t/p/w300/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    showDate: "30/06/2026",
    showtime: "09:30 - 11:30",
    cinemaName: "CGV Vincom Đồng Khởi",
    roomName: "Phòng 6",
    seatLabels: ["G4", "G5", "G6"],
    status: "PENDING",
    totalAmount: 285000,
    bookingDate: "24/06/2026 20:00",
    ticketCount: 3,
  },
];

export const getMyBookings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: MOCK_MY_BOOKINGS });
    }, 500);
  });
};

export const getBookingDetail = (bookingId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booking = MOCK_MY_BOOKINGS.find((b) => b.bookingId === bookingId);
      if (booking) {
        resolve({ data: booking });
      } else {
        reject(new Error("Booking không tồn tại"));
      }
    }, 300);
  });
};
