package org.example.backend.service;

import org.example.backend.dto.response.BookingComboResponse;
import org.example.backend.dto.response.StaffComboOrderResponse;
import org.example.backend.entity.*;
import org.example.backend.enums.BookingStatus;
import org.example.backend.enums.ComboFulfillmentStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.BookingComboRepository;
import org.example.backend.repository.BookingRepository;
import org.example.backend.repository.StaffRepository;
import org.example.backend.repository.TicketRepository;
import org.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffComboServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private BookingComboRepository bookingComboRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private UserRepository userRepository;
    @Mock private StaffRepository staffRepository;

    private StaffComboService staffComboService;

    private Staff staffUser;
    private Cinema cinemaA;
    private Cinema cinemaB;
    private Booking bookingConfirmed;
    private BookingCombo bookingCombo;

    @BeforeEach
    void setUp() {
        staffComboService = new StaffComboService(
                bookingRepository,
                bookingComboRepository,
                ticketRepository,
                userRepository,
                staffRepository
        );

        cinemaA = new Cinema();
        cinemaA.setId(1L);
        cinemaA.setName("Cinema A");

        cinemaB = new Cinema();
        cinemaB.setId(2L);
        cinemaB.setName("Cinema B");

        staffUser = new Staff();
        staffUser.setId(10L);
        staffUser.setEmail("staff@cinemax.com");
        staffUser.setFullName("Staff Member");
        staffUser.setRole(Role.STAFF);
        staffUser.setWorkingCinema(cinemaA);

        Showtime showtime = new Showtime();
        showtime.setId(100L);
        showtime.setCinema(cinemaA);

        Customer customer = new Customer();
        customer.setId(5L);
        customer.setFullName("Nguyen Van A");
        customer.setPhoneNumber("0912345678");

        bookingConfirmed = new Booking();
        bookingConfirmed.setId(1001L);
        bookingConfirmed.setStatus(BookingStatus.CONFIRMED);
        bookingConfirmed.setCustomer(customer);
        bookingConfirmed.setShowtime(showtime);

        Combo combo = Combo.builder()
                .id(1L)
                .name("Combo Solo")
                .price(79000.0)
                .build();

        bookingCombo = new BookingCombo();
        bookingCombo.setId(501L);
        bookingCombo.setBooking(bookingConfirmed);
        bookingCombo.setCombo(combo);
        bookingCombo.setQuantity(2);
        bookingCombo.setPrice(79000.0);
        bookingCombo.setFulfillmentStatus(ComboFulfillmentStatus.PAID_NOT_RECEIVED);
        
        bookingConfirmed.setBookingCombos(List.of(bookingCombo));
    }

    @Test
    @DisplayName("Search combo order by booking code - Success")
    void searchComboOrder_Success() {
        when(userRepository.findByEmail("staff@cinemax.com")).thenReturn(Optional.of(staffUser));
        when(bookingRepository.findById(1001L)).thenReturn(Optional.of(bookingConfirmed));

        StaffComboOrderResponse response = staffComboService.searchComboOrder("1001", "staff@cinemax.com");

        assertNotNull(response);
        assertEquals(1001L, response.getBookingId());
        assertEquals("CONFIRMED", response.getBookingStatus());
        assertEquals("Nguyen Van A", response.getCustomerName());
        assertEquals(1, response.getCombos().size());
        assertEquals("Combo Solo", response.getCombos().get(0).getComboName());
    }

    @Test
    @DisplayName("Search combo order - Working cinema mismatch throws 403 Forbidden")
    void searchComboOrder_WorkingCinemaMismatch_ThrowsForbidden() {
        // Change booking showtime to Cinema B
        bookingConfirmed.getShowtime().setCinema(cinemaB);

        when(userRepository.findByEmail("staff@cinemax.com")).thenReturn(Optional.of(staffUser));
        when(bookingRepository.findById(1001L)).thenReturn(Optional.of(bookingConfirmed));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                staffComboService.searchComboOrder("1001", "staff@cinemax.com")
        );

        assertEquals(403, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Nhân viên chỉ có quyền tra cứu booking thuộc rạp"));
    }

    @Test
    @DisplayName("Confirm combo received - Successful state transition to RECEIVED")
    void confirmComboReceived_Success() {
        when(userRepository.findByEmail("staff@cinemax.com")).thenReturn(Optional.of(staffUser));
        when(bookingComboRepository.findById(501L)).thenReturn(Optional.of(bookingCombo));
        when(bookingComboRepository.save(any(BookingCombo.class))).thenAnswer(i -> i.getArgument(0));

        BookingComboResponse result = staffComboService.confirmComboReceived(501L, "staff@cinemax.com");

        assertNotNull(result);
        assertEquals(ComboFulfillmentStatus.RECEIVED, result.getFulfillmentStatus());
        assertNotNull(result.getReceivedAt());
        assertEquals(10L, result.getConfirmedByStaffId());
        assertEquals("Staff Member", result.getConfirmedByStaffName());

        verify(bookingComboRepository).save(bookingCombo);
    }

    @Test
    @DisplayName("Confirm combo received - Second time confirmation throws 400 Bad Request")
    void confirmComboReceived_AlreadyReceived_ThrowsBadRequest() {
        bookingCombo.setFulfillmentStatus(ComboFulfillmentStatus.RECEIVED);
        bookingCombo.setReceivedAt(LocalDateTime.now().minusMinutes(10));
        bookingCombo.setReceivedByStaff(staffUser);

        when(userRepository.findByEmail("staff@cinemax.com")).thenReturn(Optional.of(staffUser));
        when(bookingComboRepository.findById(501L)).thenReturn(Optional.of(bookingCombo));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                staffComboService.confirmComboReceived(501L, "staff@cinemax.com")
        );

        assertEquals(400, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Combo đã được xác nhận nhận hàng trước đó"));
    }

    @Test
    @DisplayName("Confirm combo received - Unpaid or Cancelled throws 400 Bad Request")
    void confirmComboReceived_UnpaidOrCancelled_ThrowsBadRequest() {
        bookingCombo.setFulfillmentStatus(ComboFulfillmentStatus.UNPAID);

        when(userRepository.findByEmail("staff@cinemax.com")).thenReturn(Optional.of(staffUser));
        when(bookingComboRepository.findById(501L)).thenReturn(Optional.of(bookingCombo));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                staffComboService.confirmComboReceived(501L, "staff@cinemax.com")
        );

        assertEquals(400, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("chưa được thanh toán"));
    }

    @Test
    @DisplayName("Confirm combo received - Non-staff user throws 403 Forbidden")
    void confirmComboReceived_NonStaff_ThrowsForbidden() {
        Customer customerUser = new Customer();
        customerUser.setId(99L);
        customerUser.setEmail("customer@gmail.com");
        customerUser.setRole(Role.CUSTOMER);

        when(userRepository.findByEmail("customer@gmail.com")).thenReturn(Optional.of(customerUser));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                staffComboService.confirmComboReceived(501L, "customer@gmail.com")
        );

        assertEquals(403, exception.getStatusCode().value());
        assertTrue(exception.getReason().contains("Chỉ Staff đăng nhập"));
    }
}
