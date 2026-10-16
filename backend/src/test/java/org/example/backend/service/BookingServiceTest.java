package org.example.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.backend.dto.request.BookingRequest;
import org.example.backend.dto.request.ComboItemRequest;
import org.example.backend.dto.response.CheckoutResponse;
import org.example.backend.dto.response.ShowtimeSeatsResponse;
import org.example.backend.entity.*;
import org.example.backend.enums.*;
import org.example.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Test Suite: Booking & Seat Map Management
 * Chuc nang: Dat ve & Chon ghe
 *
 * 7 Test Cases:
 *   TC01 - getShowtimeSeats: Lay so do ghe thanh cong (allSeats, seatHolds, bookedSeats)
 *   TC02 - getShowtimeSeats: That bai vi khong tim thay suat chieu (404 NOT_FOUND)
 *   TC03 - checkout: Dat ve va combo thanh cong (Booking PENDING, Ticket PENDING, Payment UNPAID, sinh VNPay URL)
 *   TC04 - checkout: That bai vi mot so ghe khong hop le trong DB (400 BAD_REQUEST)
 *   TC05 - checkout: That bai vi ghe da co nguoi dat truoc do (409 CONFLICT)
 *   TC06 - handleVNPayReturn: Thanh toan thanh cong (code 00 -> Payment PAID, Booking CONFIRMED, Ticket CONFIRMED, Combo PAID_NOT_RECEIVED)
 *   TC07 - handleVNPayReturn: Thanh toan that bai (code 24 -> Payment FAILED, Booking CANCELLED, Ticket CANCELLED, Combo CANCELLED)
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private SeatHoldRepository seatHoldRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private VoucherService voucherService;

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private VNPayService vnPayService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ComboRepository comboRepository;

    @Mock
    private BookingComboRepository bookingComboRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    private BookingService bookingService;

    private Showtime sampleShowtime;
    private Room sampleRoom;
    private Customer sampleCustomer;
    private Seat seatA1;
    private Seat seatA2;
    private Combo sampleCombo;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                locationRepository,
                showtimeRepository,
                seatHoldRepository,
                ticketRepository,
                seatRepository,
                bookingRepository,
                paymentRepository,
                voucherService,
                voucherRepository,
                vnPayService,
                customerRepository,
                comboRepository,
                bookingComboRepository
        );

        ReflectionTestUtils.setField(bookingService, "bookingReturnUrl", "http://localhost:8081/api/bookings/vnpay-return");

        sampleRoom = new Room();
        sampleRoom.setId(10L);
        sampleRoom.setName("Phòng 01");
        sampleRoom.setRoomCode("R01");
        sampleRoom.setSeatCount(100);

        sampleShowtime = new Showtime();
        sampleShowtime.setId(1L);
        sampleShowtime.setRoom(sampleRoom);
        sampleShowtime.setBasePrice(90000.0);
        sampleShowtime.setStartTime(LocalDateTime.now().plusDays(1));
        sampleShowtime.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        sampleShowtime.setStatus(ShowtimeStatus.AVAILABLE);

        sampleCustomer = new Customer();
        sampleCustomer.setId(100L);
        sampleCustomer.setFullName("Nguyen Van A");

        seatA1 = new Seat();
        seatA1.setId(101L);
        seatA1.setRowLabel("A");
        seatA1.setColumnNumber(1);
        seatA1.setSeatType(SeatType.STANDARD);
        seatA1.setStatus(SeatStatus.AVAILABLE);
        seatA1.setRoom(sampleRoom);

        seatA2 = new Seat();
        seatA2.setId(102L);
        seatA2.setRowLabel("A");
        seatA2.setColumnNumber(2);
        seatA2.setSeatType(SeatType.VIP);
        seatA2.setStatus(SeatStatus.AVAILABLE);
        seatA2.setRoom(sampleRoom);

        sampleCombo = Combo.builder()
                .id(1L)
                .name("Bắp Nước Solo")
                .price(65000.0)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("TC01 - Lay so do ghe thanh cong (allSeats, seatHolds, bookedSeats)")
    void getShowtimeSeats_Success() {
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(sampleShowtime));
        when(seatRepository.findByRoomId(10L)).thenReturn(List.of(seatA1, seatA2));

        SeatHold hold = new SeatHold();
        hold.setId(50L);
        hold.setSeat(seatA1);
        hold.setCustomer(sampleCustomer);
        hold.setHoldTime(LocalDateTime.now());
        when(seatHoldRepository.findByShowtimeId(1L)).thenReturn(List.of(hold));

        when(ticketRepository.findBookedSeatIdsByShowtimeId(1L)).thenReturn(List.of(102L));

        ShowtimeSeatsResponse response = bookingService.getShowtimeSeats(1L);

        assertNotNull(response);
        assertEquals(2, response.getAllSeats().size());
        assertEquals("A", response.getAllSeats().get(0).getRowLabel());
        assertEquals(1, response.getSeatHolds().size());
        assertEquals(101L, response.getSeatHolds().get(0).getSeatId());
        assertEquals(1, response.getBookedSeatIds().size());
        assertTrue(response.getBookedSeatIds().contains(102L));
        verify(showtimeRepository, times(1)).findById(1L);
        verify(seatRepository, times(1)).findByRoomId(10L);
    }

    @Test
    @DisplayName("TC02 - Lay so do ghe that bai vi suat chieu khong ton tai")
    void getShowtimeSeats_NotFoundShowtime_ThrowsException() {
        when(showtimeRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            bookingService.getShowtimeSeats(999L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertEquals("Không tìm thấy suất chiếu", exception.getReason());
        verify(seatRepository, never()).findByRoomId(anyLong());
    }

    @Test
    @DisplayName("TC03 - Checkout dat ve va combo thanh cong (Tao Booking PENDING, Tickets PENDING, Payment UNPAID)")
    void checkout_Success_CreatePendingBookingAndTickets() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(100L);
        request.setShowtimeId(1L);
        request.setSeatIds(List.of(101L, 102L));

        ComboItemRequest comboItem = new ComboItemRequest();
        comboItem.setComboId(1L);
        comboItem.setQuantity(2);
        request.setCombos(List.of(comboItem));

        when(customerRepository.findById(100L)).thenReturn(Optional.of(sampleCustomer));
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(sampleShowtime));
        when(seatRepository.findAllById(request.getSeatIds())).thenReturn(List.of(seatA1, seatA2));
        when(ticketRepository.findBookedSeatIdsByShowtimeId(1L)).thenReturn(Collections.emptyList());
        when(comboRepository.findById(1L)).thenReturn(Optional.of(sampleCombo));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(200L);
            return b;
        });

        when(vnPayService.createPaymentUrl(any(), eq(310000L), anyString(), anyString(), anyString()))
                .thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?mockToken=123");

        CheckoutResponse response = bookingService.checkout(request, httpServletRequest);

        assertNotNull(response);
        assertEquals(200L, response.getBookingId());
        // basePrice: 90000 * 2 = 180000; combo: 65000 * 2 = 130000 -> Total: 310000.0
        assertEquals(310000.0, response.getTotalAmount());
        assertNotNull(response.getPaymentUrl());
        assertTrue(response.getPaymentUrl().contains("vnpayment.vn"));

        verify(bookingRepository, times(1)).save(argThat(b -> b.getStatus() == BookingStatus.PENDING));
        verify(bookingComboRepository, times(1)).saveAll(anyList());
        verify(ticketRepository, times(1)).saveAll(argThat(tickets -> ((List<?>) tickets).size() == 2));
        verify(paymentRepository, times(1)).save(argThat(p -> p.getStatus() == PaymentStatus.UNPAID && p.getAmount() == 310000.0));
    }

    @Test
    @DisplayName("TC04 - Checkout that bai vi danh sach ghe khong hop le trong he thong")
    void checkout_InvalidSeats_ThrowsBadRequest() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(100L);
        request.setShowtimeId(1L);
        request.setSeatIds(List.of(101L, 102L, 999L)); // Yeu cau 3 ghe

        when(customerRepository.findById(100L)).thenReturn(Optional.of(sampleCustomer));
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(sampleShowtime));
        // DB chi tim thay 2 ghe hop le
        when(seatRepository.findAllById(request.getSeatIds())).thenReturn(List.of(seatA1, seatA2));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            bookingService.checkout(request, httpServletRequest);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Một số ghế không hợp lệ", exception.getReason());
        verify(bookingRepository, never()).save(any());
        verify(ticketRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("TC05 - Checkout that bai vi co ghe da duoc nguoi khac dat truoc (Xung dot)")
    void checkout_AlreadyBookedSeat_ThrowsConflict() {
        BookingRequest request = new BookingRequest();
        request.setCustomerId(100L);
        request.setShowtimeId(1L);
        request.setSeatIds(List.of(101L, 102L));

        when(customerRepository.findById(100L)).thenReturn(Optional.of(sampleCustomer));
        when(showtimeRepository.findById(1L)).thenReturn(Optional.of(sampleShowtime));
        when(seatRepository.findAllById(request.getSeatIds())).thenReturn(List.of(seatA1, seatA2));
        // Ghe 102L da duoc nguoi khac dat
        when(ticketRepository.findBookedSeatIdsByShowtimeId(1L)).thenReturn(List.of(102L));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            bookingService.checkout(request, httpServletRequest);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Ghế đã được đặt"));
        verify(bookingRepository, never()).save(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC06 - Xu ly callback VNPay thanh cong: chuyen sang PAID, CONFIRMED, va tang usedCount voucher")
    void handleVNPayReturn_Success_UpdatesToConfirmedAndPaid() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "TXN12345678");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", "mockHash");

        when(vnPayService.verifyPayment(params)).thenReturn(true);

        Voucher voucher = new Voucher();
        voucher.setId(5L);
        voucher.setCode("DISCOUNT10");
        voucher.setUsedCount(2);

        Booking booking = new Booking();
        booking.setId(300L);
        booking.setStatus(BookingStatus.PENDING);
        booking.setVoucher(voucher);

        Payment payment = new Payment();
        payment.setId(400L);
        payment.setTransactionCode("TXN12345678");
        payment.setStatus(PaymentStatus.UNPAID);
        payment.setBooking(booking);

        Ticket ticket = new Ticket();
        ticket.setId(501L);
        ticket.setStatus(TicketStatus.PENDING);

        BookingCombo combo = new BookingCombo();
        combo.setId(601L);
        combo.setFulfillmentStatus(ComboFulfillmentStatus.PENDING_PAYMENT);

        when(paymentRepository.findByTransactionCode("TXN12345678")).thenReturn(Optional.of(payment));
        when(ticketRepository.findByBookingId(300L)).thenReturn(List.of(ticket));
        when(bookingComboRepository.findByBookingId(300L)).thenReturn(List.of(combo));

        bookingService.handleVNPayReturn(params);

        assertEquals(PaymentStatus.PAID, payment.getStatus());
        assertNotNull(payment.getPaidAt());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        assertEquals(3, voucher.getUsedCount());
        assertEquals(TicketStatus.CONFIRMED, ticket.getStatus());
        assertEquals(ComboFulfillmentStatus.PAID_NOT_RECEIVED, combo.getFulfillmentStatus());

        verify(paymentRepository, times(1)).save(payment);
        verify(bookingRepository, times(1)).save(booking);
        verify(voucherRepository, times(1)).save(voucher);
        verify(ticketRepository, times(1)).saveAll(anyList());
        verify(bookingComboRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("TC07 - Xu ly callback VNPay that bai: huy don, Payment FAILED, Booking CANCELLED")
    void handleVNPayReturn_FailedResponse_UpdatesToCancelledAndFailed() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "TXN99999999");
        params.put("vnp_ResponseCode", "24"); // Khách hàng hủy giao dịch
        params.put("vnp_SecureHash", "mockHash");

        when(vnPayService.verifyPayment(params)).thenReturn(true);

        Booking booking = new Booking();
        booking.setId(301L);
        booking.setStatus(BookingStatus.PENDING);

        Payment payment = new Payment();
        payment.setId(401L);
        payment.setTransactionCode("TXN99999999");
        payment.setStatus(PaymentStatus.UNPAID);
        payment.setBooking(booking);

        Ticket ticket = new Ticket();
        ticket.setId(502L);
        ticket.setStatus(TicketStatus.PENDING);

        BookingCombo combo = new BookingCombo();
        combo.setId(602L);
        combo.setFulfillmentStatus(ComboFulfillmentStatus.PENDING_PAYMENT);

        when(paymentRepository.findByTransactionCode("TXN99999999")).thenReturn(Optional.of(payment));
        when(ticketRepository.findByBookingId(301L)).thenReturn(List.of(ticket));
        when(bookingComboRepository.findByBookingId(301L)).thenReturn(List.of(combo));

        bookingService.handleVNPayReturn(params);

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        assertEquals(TicketStatus.CANCELLED, ticket.getStatus());
        assertEquals(ComboFulfillmentStatus.CANCELLED, combo.getFulfillmentStatus());

        verify(paymentRepository, times(1)).save(payment);
        verify(bookingRepository, times(1)).save(booking);
        verify(voucherRepository, never()).save(any());
        verify(ticketRepository, times(1)).saveAll(anyList());
        verify(bookingComboRepository, times(1)).saveAll(anyList());
    }
}
