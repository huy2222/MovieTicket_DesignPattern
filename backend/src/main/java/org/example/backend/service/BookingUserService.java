package org.example.backend.service;

import org.example.backend.dto.response.MyBookingResponse;
import org.example.backend.entity.Booking;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Movie;
import org.example.backend.entity.Room;
import org.example.backend.entity.Showtime;
import org.example.backend.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingUserService {

    private final BookingRepository bookingRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public BookingUserService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<MyBookingResponse> getMyBookings(Long customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerIdOrderByBookingDateDesc(customerId);

        return bookings.stream()
                .map(this::mapToMyBookingResponse)
                .toList();
    }

    public MyBookingResponse getBookingDetail(Long bookingId, Long customerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));

        if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(customerId)) {
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

        List<org.example.backend.dto.response.BookingComboResponse> comboResponses = booking.getBookingCombos() != null
                ? booking.getBookingCombos().stream()
                .map(bc -> org.example.backend.dto.response.BookingComboResponse.builder()
                        .id(bc.getId())
                        .comboId(bc.getCombo() != null ? bc.getCombo().getId() : null)
                        .comboName(bc.getCombo() != null ? bc.getCombo().getName() : "Combo")
                        .description(bc.getCombo() != null ? bc.getCombo().getDescription() : "")
                        .imageUrl(bc.getCombo() != null ? bc.getCombo().getImageUrl() : "")
                        .quantity(bc.getQuantity())
                        .price(bc.getPrice())
                        .fulfillmentStatus(bc.getFulfillmentStatus())
                        .receivedAt(bc.getReceivedAt())
                        .confirmedByStaffId(bc.getReceivedByStaff() != null ? bc.getReceivedByStaff().getId() : null)
                        .confirmedByStaffName(bc.getReceivedByStaff() != null ? bc.getReceivedByStaff().getFullName() : null)
                        .build())
                .toList()
                : List.of();

        return MyBookingResponse.builder()
                .bookingId(booking.getId())
                .movieTitle(movie.getTitle())
                .posterUrl(movie.getImages())
                .showDate(showtime.getStartTime().format(DATE_FORMATTER))
                .showtime(showtime.getStartTime().format(TIME_FORMATTER) + " - " + showtime.getEndTime().format(TIME_FORMATTER))
                .cinemaName(cinema.getName())
                .roomName(room.getName())
                .seatLabels(seatLabels)
                .status(booking.getStatus().name())
                .totalAmount(booking.getTotalAmount())
                .bookingDate(booking.getBookingDate().format(DATETIME_FORMATTER))
                .ticketCount(booking.getTickets().size())
                .combos(comboResponses)
                .build();
    }
}

