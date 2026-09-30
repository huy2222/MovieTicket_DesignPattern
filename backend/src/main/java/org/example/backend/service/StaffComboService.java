package org.example.backend.service;

import org.example.backend.dto.response.BookingComboResponse;
import org.example.backend.dto.response.StaffComboOrderResponse;
import org.example.backend.entity.Booking;
import org.example.backend.entity.BookingCombo;
import org.example.backend.entity.Staff;
import org.example.backend.entity.Ticket;
import org.example.backend.entity.User;
import org.example.backend.enums.ComboFulfillmentStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.BookingComboRepository;
import org.example.backend.repository.BookingRepository;
import org.example.backend.repository.StaffRepository;
import org.example.backend.repository.TicketRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StaffComboService {

    private final BookingRepository bookingRepository;
    private final BookingComboRepository bookingComboRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    public StaffComboService(BookingRepository bookingRepository,
                             BookingComboRepository bookingComboRepository,
                             TicketRepository ticketRepository,
                             UserRepository userRepository,
                             StaffRepository staffRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingComboRepository = bookingComboRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
    }

    public StaffComboOrderResponse searchComboOrder(String bookingCode, String currentUserEmail) {
        Staff staff = getStaffUser(currentUserEmail);

        Booking booking = findBookingByCodeOrTicket(bookingCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy booking với mã: " + bookingCode));

        // Rule 5: If staff belongs to a specific cinema, check working cinema
        if (staff != null && staff.getWorkingCinema() != null) {
            Long cinemaId = booking.getShowtime() != null && booking.getShowtime().getCinema() != null
                    ? booking.getShowtime().getCinema().getId()
                    : null;
            if (cinemaId != null && !cinemaId.equals(staff.getWorkingCinema().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Nhân viên chỉ có quyền tra cứu booking thuộc rạp: " + staff.getWorkingCinema().getName());
            }
        }

        return mapToStaffComboOrderResponse(booking);
    }

    @Transactional
    public BookingComboResponse confirmComboReceived(Long bookingComboId, String currentUserEmail) {
        Staff staff = getStaffUser(currentUserEmail);
        if (staff == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ Staff đăng nhập mới được xác nhận.");
        }

        BookingCombo bookingCombo = bookingComboRepository.findById(bookingComboId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy đơn combo với ID: " + bookingComboId));

        Booking booking = bookingCombo.getBooking();

        // Rule 5: Check cinema authorization if staff works at a specific cinema
        if (staff.getWorkingCinema() != null) {
            Long cinemaId = booking.getShowtime() != null && booking.getShowtime().getCinema() != null
                    ? booking.getShowtime().getCinema().getId()
                    : null;
            if (cinemaId != null && !cinemaId.equals(staff.getWorkingCinema().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Nhân viên không có quyền xác nhận combo thuộc rạp khác.");
            }
        }

        // Rule check: Booking/combo unresolved or cancelled
        if (booking.getStatus() == org.example.backend.enums.BookingStatus.CANCELLED ||
                bookingCombo.getFulfillmentStatus() == ComboFulfillmentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking hoặc combo đã bị HỦY (CANCELLED), không thể xác nhận giao.");
        }

        if (booking.getStatus() != org.example.backend.enums.BookingStatus.CONFIRMED ||
                bookingCombo.getFulfillmentStatus() == ComboFulfillmentStatus.UNPAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking hoặc combo chưa được thanh toán.");
        }


        // Rule check: Combo must be in PAID_NOT_RECEIVED
        if (bookingCombo.getFulfillmentStatus() == ComboFulfillmentStatus.RECEIVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Combo đã được xác nhận nhận hàng trước đó vào lúc "
                            + bookingCombo.getReceivedAt() + " bởi nhân viên "
                            + (bookingCombo.getReceivedByStaff() != null ? bookingCombo.getReceivedByStaff().getFullName() : "khác"));
        }

        if (bookingCombo.getFulfillmentStatus() != ComboFulfillmentStatus.PAID_NOT_RECEIVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Combo phải ở trạng thái PAID_NOT_RECEIVED mới được chuyển sang RECEIVED.");
        }

        // Perform State Transition
        bookingCombo.setFulfillmentStatus(ComboFulfillmentStatus.RECEIVED);
        bookingCombo.setReceivedAt(LocalDateTime.now());
        bookingCombo.setReceivedByStaff(staff);

        BookingCombo savedCombo = bookingComboRepository.save(bookingCombo);
        return mapToBookingComboResponse(savedCombo);
    }

    private Optional<Booking> findBookingByCodeOrTicket(String input) {
        if (input == null || input.trim().isEmpty()) {
            return Optional.empty();
        }

        String clean = input.trim();

        // 1. Try numeric booking ID
        String numericPart = clean.replaceAll("(?i)^BK-?", "");
        try {
            Long bookingId = Long.parseLong(numericPart);
            Optional<Booking> byId = bookingRepository.findById(bookingId);
            if (byId.isPresent()) {
                return byId;
            }
        } catch (NumberFormatException ignored) {
        }

        // 2. Try ticket code
        Optional<Ticket> byTicketCode = ticketRepository.findByTicketCode(clean);
        if (byTicketCode.isPresent() && byTicketCode.get().getBooking() != null) {
            return Optional.of(byTicketCode.get().getBooking());
        }

        // 3. Try confirmation code
        Optional<Ticket> byConfirmCode = ticketRepository.findByConfirmationCode(clean);
        if (byConfirmCode.isPresent() && byConfirmCode.get().getBooking() != null) {
            return Optional.of(byConfirmCode.get().getBooking());
        }

        return Optional.empty();
    }

    private Staff getStaffUser(String email) {
        if (email == null) return null;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user instanceof Staff staffUser) {
            return staffUser;
        }
        if (user != null && (user.getRole() == Role.STAFF || user.getRole() == Role.ADMIN)) {
            // Check if staff entity exists for this user ID
            Optional<Staff> staffOpt = staffRepository.findById(user.getId());
            if (staffOpt.isPresent()) {
                return staffOpt.get();
            }
            // Create a dummy staff wrapper if missing from staff table but role is STAFF/ADMIN
            Staff staff = new Staff();
            staff.setId(user.getId());
            staff.setEmail(user.getEmail());
            staff.setFullName(user.getFullName());
            staff.setRole(user.getRole());
            return staff;
        }
        return null;
    }

    public StaffComboOrderResponse mapToStaffComboOrderResponse(Booking booking) {
        List<String> seatLabels = booking.getTickets() != null ? booking.getTickets().stream()
                .map(t -> t.getSeat() != null ? t.getSeat().getRowLabel() + t.getSeat().getColumnNumber() : "")
                .filter(s -> !s.isEmpty())
                .sorted()
                .toList() : List.of();

        List<BookingComboResponse> comboResponses = booking.getBookingCombos() != null
                ? booking.getBookingCombos().stream().map(this::mapToBookingComboResponse).toList()
                : List.of();

        return StaffComboOrderResponse.builder()
                .bookingId(booking.getId())
                .bookingStatus(booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN")
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getFullName() : "Khách lẻ")
                .customerPhone(booking.getCustomer() != null ? booking.getCustomer().getPhoneNumber() : "N/A")
                .customerEmail(booking.getCustomer() != null ? booking.getCustomer().getEmail() : "N/A")
                .movieTitle(booking.getShowtime() != null && booking.getShowtime().getMovie() != null
                        ? booking.getShowtime().getMovie().getTitle() : "N/A")
                .cinemaName(booking.getShowtime() != null && booking.getShowtime().getCinema() != null
                        ? booking.getShowtime().getCinema().getName() : "N/A")
                .roomName(booking.getShowtime() != null && booking.getShowtime().getRoom() != null
                        ? booking.getShowtime().getRoom().getName() : "N/A")
                .showtimeStart(booking.getShowtime() != null ? booking.getShowtime().getStartTime() : null)
                .seatLabels(seatLabels)
                .combos(comboResponses)
                .build();
    }

    public BookingComboResponse mapToBookingComboResponse(BookingCombo bc) {
        return BookingComboResponse.builder()
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
                .build();
    }
}
