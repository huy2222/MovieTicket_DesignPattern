package org.example.backend.service;

import org.example.backend.decorator.VoucherFactory;
import org.example.backend.dto.request.VoucherRequest;
import org.example.backend.dto.response.VoucherResponse;
import org.example.backend.entity.Voucher;
import org.example.backend.enums.VoucherStatus;
import org.example.backend.enums.VoucherType;
import org.example.backend.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test Suite: Voucher & Promotion Management
 * Chuc nang: Khuyen mai & Giam gia
 *
 * 7 Test Cases:
 *   TC01 - Tao voucher moi thanh cong (status mac dinh = SUSPENDED)
 *   TC02 - Tao voucher that bai vi trung ma code
 *   TC03 - Kich hoat voucher (SUSPENDED -> ACTIVE) thanh cong
 *   TC04 - Kich hoat voucher da EXPIRED nem RuntimeException
 *   TC05 - Tam ngung voucher (ACTIVE -> SUSPENDED) thanh cong
 *   TC06 - applyVoucher PERCENT_DISCOUNT tinh dung gia sau giam
 *   TC07 - applyVoucher that bai khi voucher da het han (endTime qua khu)
 */
@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    private VoucherService voucherService;

    // Su dung VoucherFactory that vi no khong phu thuoc DB
    private final VoucherFactory voucherFactory = new VoucherFactory();

    private Voucher activePercentVoucher;
    private Voucher suspendedVoucher;
    private Voucher expiredVoucher;

    @BeforeEach
    void setUp() {
        voucherService = new VoucherService(voucherRepository, voucherFactory);

        activePercentVoucher = new Voucher();
        activePercentVoucher.setId(1L);
        activePercentVoucher.setName("Giam 20% Tat Ca");
        activePercentVoucher.setCode("SALE20");
        activePercentVoucher.setDescription("Voucher giam 20%");
        activePercentVoucher.setStatus(VoucherStatus.ACTIVE);
        activePercentVoucher.setVoucherType(VoucherType.PERCENT_DISCOUNT);
        activePercentVoucher.setDiscountPercent(20.0);
        activePercentVoucher.setMinimumOrderAmount(0.0);
        activePercentVoucher.setUsageLimit(100);
        activePercentVoucher.setUsedCount(10);
        activePercentVoucher.setStartTime(LocalDateTime.now().minusDays(1));
        activePercentVoucher.setEndTime(LocalDateTime.now().plusDays(30));

        suspendedVoucher = new Voucher();
        suspendedVoucher.setId(2L);
        suspendedVoucher.setName("Voucher Tam Ngung");
        suspendedVoucher.setCode("SUSPEND01");
        suspendedVoucher.setStatus(VoucherStatus.SUSPENDED);
        suspendedVoucher.setVoucherType(VoucherType.PERCENT_DISCOUNT);
        suspendedVoucher.setDiscountPercent(10.0);
        suspendedVoucher.setMinimumOrderAmount(0.0);
        suspendedVoucher.setUsageLimit(50);
        suspendedVoucher.setUsedCount(0);

        expiredVoucher = new Voucher();
        expiredVoucher.setId(3L);
        expiredVoucher.setName("Voucher Het Han");
        expiredVoucher.setCode("EXPIRED01");
        expiredVoucher.setStatus(VoucherStatus.EXPIRED);
        expiredVoucher.setVoucherType(VoucherType.PERCENT_DISCOUNT);
        expiredVoucher.setDiscountPercent(15.0);
        expiredVoucher.setMinimumOrderAmount(0.0);
        expiredVoucher.setUsageLimit(0);
        expiredVoucher.setUsedCount(0);
    }

    @Test
    @DisplayName("TC01 - Tao voucher moi thanh cong, status mac dinh la SUSPENDED")
    void createVoucher_Success_DefaultSuspendedStatus() {
        VoucherRequest request = new VoucherRequest();
        request.setName("Flash Sale Cuoi Tuan");
        request.setCode("FLASH50");
        request.setDescription("Giam 50% cuoi tuan");
        request.setVoucherType(VoucherType.PERCENT_DISCOUNT.name());
        request.setDiscountPercent(50.0);
        request.setMinimumOrderAmount(100000.0);
        request.setUsageLimit(200);

        when(voucherRepository.existsByCode("FLASH50")).thenReturn(false);

        Voucher savedVoucher = new Voucher();
        savedVoucher.setId(10L);
        savedVoucher.setName("Flash Sale Cuoi Tuan");
        savedVoucher.setCode("FLASH50");
        savedVoucher.setDescription("Giam 50% cuoi tuan");
        savedVoucher.setVoucherType(VoucherType.PERCENT_DISCOUNT);
        savedVoucher.setDiscountPercent(50.0);
        savedVoucher.setMinimumOrderAmount(100000.0);
        savedVoucher.setUsageLimit(200);
        savedVoucher.setUsedCount(0);
        savedVoucher.setStatus(VoucherStatus.SUSPENDED);
        when(voucherRepository.save(any(Voucher.class))).thenReturn(savedVoucher);

        VoucherResponse response = voucherService.createVoucher(request);

        assertNotNull(response);
        assertEquals("FLASH50", response.getCode());
        assertEquals("SUSPENDED", response.getStatus());
        assertEquals(10L, response.getId());

        verify(voucherRepository).existsByCode("FLASH50");
        verify(voucherRepository).save(any(Voucher.class));
    }

    @Test
    @DisplayName("TC02 - Tao voucher that bai vi ma code da ton tai")
    void createVoucher_DuplicateCode_ThrowsException() {
        VoucherRequest request = new VoucherRequest();
        request.setName("Voucher Trung Ma");
        request.setCode("SALE20");
        request.setVoucherType(VoucherType.PERCENT_DISCOUNT.name());
        request.setDiscountPercent(20.0);

        when(voucherRepository.existsByCode("SALE20")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> voucherService.createVoucher(request));

        assertEquals("Mã voucher đã tồn tại", exception.getMessage());

        verify(voucherRepository).existsByCode("SALE20");
        verify(voucherRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC03 - Kich hoat voucher SUSPENDED -> ACTIVE thanh cong")
    void activateVoucher_FromSuspended_Success() {
        when(voucherRepository.findById(2L)).thenReturn(Optional.of(suspendedVoucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> inv.getArgument(0));

        VoucherResponse response = voucherService.activateVoucher(2L);

        assertNotNull(response);
        assertEquals("ACTIVE", response.getStatus());
        assertEquals(VoucherStatus.ACTIVE, suspendedVoucher.getStatus());

        verify(voucherRepository).save(suspendedVoucher);
    }

    @Test
    @DisplayName("TC04 - Kich hoat voucher EXPIRED nem RuntimeException")
    void activateVoucher_AlreadyExpired_ThrowsException() {
        when(voucherRepository.findById(3L)).thenReturn(Optional.of(expiredVoucher));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> voucherService.activateVoucher(3L));

        assertEquals("Không thể kích hoạt voucher đã hết hạn", exception.getMessage());

        verify(voucherRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC05 - Tam ngung voucher ACTIVE -> SUSPENDED thanh cong")
    void suspendVoucher_FromActive_Success() {
        when(voucherRepository.findById(1L)).thenReturn(Optional.of(activePercentVoucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> inv.getArgument(0));

        VoucherResponse response = voucherService.suspendVoucher(1L);

        assertNotNull(response);
        assertEquals("SUSPENDED", response.getStatus());
        assertEquals(VoucherStatus.SUSPENDED, activePercentVoucher.getStatus());

        verify(voucherRepository).save(activePercentVoucher);
    }

    @Test
    @DisplayName("TC06 - applyVoucher PERCENT_DISCOUNT 20% tinh dung gia sau giam")
    void applyVoucher_PercentDiscount_CalculatesCorrectly() {
        double originalPrice = 500000.0;
        int ticketCount = 2;

        when(voucherRepository.findByCode("SALE20")).thenReturn(Optional.of(activePercentVoucher));

        double finalPrice = voucherService.applyVoucher("SALE20", originalPrice, ticketCount);

        // 500,000 * (1 - 20/100) = 400,000
        assertEquals(400000.0, finalPrice, 0.01,
                "Gia sau khi giam 20% tu 500,000 phai la 400,000");
    }

    @Test
    @DisplayName("TC07 - applyVoucher that bai khi voucher da het han (endTime qua khu)")
    void applyVoucher_ExpiredByEndTime_ThrowsException() {
        Voucher overdueVoucher = new Voucher();
        overdueVoucher.setId(99L);
        overdueVoucher.setCode("OVERDUE");
        overdueVoucher.setStatus(VoucherStatus.ACTIVE);
        overdueVoucher.setVoucherType(VoucherType.PERCENT_DISCOUNT);
        overdueVoucher.setDiscountPercent(10.0);
        overdueVoucher.setMinimumOrderAmount(0.0);
        overdueVoucher.setUsageLimit(0);
        overdueVoucher.setUsedCount(0);
        overdueVoucher.setStartTime(LocalDateTime.now().minusDays(30));
        overdueVoucher.setEndTime(LocalDateTime.now().minusDays(1));

        when(voucherRepository.findByCode("OVERDUE")).thenReturn(Optional.of(overdueVoucher));
        when(voucherRepository.save(any(Voucher.class))).thenReturn(overdueVoucher);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> voucherService.applyVoucher("OVERDUE", 300000.0, 1));

        assertEquals("Voucher đã hết hạn sử dụng", exception.getMessage());
        assertEquals(VoucherStatus.EXPIRED, overdueVoucher.getStatus());

        verify(voucherRepository).save(overdueVoucher);
    }

    @Test
    @DisplayName("TC08 - applyVoucher MAX_CAP_PERCENT_DISCOUNT gioi han muc giam toi da")
    void applyVoucher_MaxCapPercentDiscount_CapsDiscountAtMaxAmount() {
        Voucher maxCapVoucher = new Voucher();
        maxCapVoucher.setId(100L);
        maxCapVoucher.setCode("MAXCAP50");
        maxCapVoucher.setStatus(VoucherStatus.ACTIVE);
        maxCapVoucher.setVoucherType(VoucherType.MAX_CAP_PERCENT_DISCOUNT);
        maxCapVoucher.setDiscountPercent(50.0);
        maxCapVoucher.setMaxDiscountAmount(30000.0);
        maxCapVoucher.setMinimumOrderAmount(50000.0);
        maxCapVoucher.setUsageLimit(10);
        maxCapVoucher.setUsedCount(0);
        maxCapVoucher.setStartTime(LocalDateTime.now().minusDays(1));
        maxCapVoucher.setEndTime(LocalDateTime.now().plusDays(10));

        when(voucherRepository.findByCode("MAXCAP50")).thenReturn(Optional.of(maxCapVoucher));

        // Truong hop 1: Don 200k, giam 50% = 100k > tran 30k -> giam 30k, con 170k
        double priceExceedingCap = voucherService.applyVoucher("MAXCAP50", 200000.0, 2);
        assertEquals(170000.0, priceExceedingCap, 0.01,
                "Don 200,000 giam 50% co tran 30,000 thi gia sau giam phai la 170,000");

        // Truong hop 2: Don duoi minimumOrderAmount (40k < 50k) -> nem RuntimeException
        assertThrows(RuntimeException.class, () -> voucherService.applyVoucher("MAXCAP50", 40000.0, 1));
    }
}