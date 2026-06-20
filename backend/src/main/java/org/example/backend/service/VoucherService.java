package org.example.backend.service;

import org.example.backend.decorator.VoucherComponent;
import org.example.backend.decorator.VoucherFactory;
import org.example.backend.dto.request.VoucherRequest;
import org.example.backend.dto.response.VoucherResponse;
import org.example.backend.entity.Voucher;
import org.example.backend.enums.VoucherStatus;
import org.example.backend.enums.VoucherType;
import org.example.backend.repository.VoucherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherFactory voucherFactory;

    public VoucherService(VoucherRepository voucherRepository, VoucherFactory voucherFactory) {
        this.voucherRepository = voucherRepository;
        this.voucherFactory = voucherFactory;
    }

    // 1. Lấy tất cả voucher
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 2. Lấy chi tiết 1 voucher
    public VoucherResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        return mapToResponse(voucher);
    }

    // 3. Tạo voucher mới (status = SUSPENDED)
    public VoucherResponse createVoucher(VoucherRequest request) {
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã voucher đã tồn tại");
        }

        Voucher voucher = new Voucher();
        mapRequestToEntity(request, voucher);
        voucher.setStatus(VoucherStatus.SUSPENDED);
        voucher.setUsedCount(0);

        Voucher savedVoucher = voucherRepository.save(voucher);
        return mapToResponse(savedVoucher);
    }

    // 4. Cập nhật voucher (chỉ khi DRAFT hoặc SUSPENDED)
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        if (voucher.getStatus() != VoucherStatus.DRAFT && voucher.getStatus() != VoucherStatus.SUSPENDED) {
            throw new RuntimeException("Chỉ có thể chỉnh sửa voucher ở trạng thái KHÓA hoặc DRAFT");
        }

        if (!voucher.getCode().equalsIgnoreCase(request.getCode()) && voucherRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã voucher mới đã tồn tại");
        }

        mapRequestToEntity(request, voucher);
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return mapToResponse(updatedVoucher);
    }

    // 5. Kích hoạt voucher (DRAFT/SUSPENDED → ACTIVE)
    public VoucherResponse activateVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        if (voucher.getStatus() == VoucherStatus.EXPIRED) {
            throw new RuntimeException("Không thể kích hoạt voucher đã hết hạn");
        }
        voucher.setStatus(VoucherStatus.ACTIVE);
        Voucher savedVoucher = voucherRepository.save(voucher);
        return mapToResponse(savedVoucher);
    }

    // 6. Tạm ngưng voucher (ACTIVE → SUSPENDED)
    public VoucherResponse suspendVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Chỉ có thể tạm ngưng voucher đang hoạt động");
        }
        voucher.setStatus(VoucherStatus.SUSPENDED);
        Voucher savedVoucher = voucherRepository.save(voucher);
        return mapToResponse(savedVoucher);
    }

    // 7. Xoá voucher (chỉ khi DRAFT hoặc SUSPENDED)
    @org.springframework.transaction.annotation.Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        if (voucher.getStatus() != VoucherStatus.DRAFT && voucher.getStatus() != VoucherStatus.SUSPENDED) {
            throw new RuntimeException("Chỉ có thể xóa voucher ở trạng thái KHÓA hoặc DRAFT");
        }
        
        if (voucher.getAppliedBookings() != null) {
            for (org.example.backend.entity.Booking booking : voucher.getAppliedBookings()) {
                booking.setVoucher(null);
            }
        }
        
        voucherRepository.delete(voucher);
    }

    // 8. Áp dụng voucher cho booking (khách hàng nhập mã)
    public double applyVoucher(String code, double originalPrice, int ticketCount) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Mã voucher không tồn tại"));

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new RuntimeException("Voucher không hoạt động");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartTime() != null && now.isBefore(voucher.getStartTime())) {
            throw new RuntimeException("Voucher chưa đến thời gian áp dụng");
        }

        if (voucher.getEndTime() != null && now.isAfter(voucher.getEndTime())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            throw new RuntimeException("Voucher đã hết hạn sử dụng");
        }

        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Voucher đã đạt giới hạn lượt sử dụng");
        }

        if (originalPrice < voucher.getMinimumOrderAmount()) {
            throw new RuntimeException("Giá trị đơn hàng không đủ điều kiện tối thiểu (" + voucher.getMinimumOrderAmount() + " VNĐ)");
        }

        VoucherComponent component = voucherFactory.createVoucherComponent(voucher);
        return component.calculatePrice(originalPrice, ticketCount);
    }

    // Helpers
    private VoucherResponse mapToResponse(Voucher voucher) {
        VoucherComponent component = voucherFactory.createVoucherComponent(voucher);
        return VoucherResponse.builder()
                .id(voucher.getId())
                .name(voucher.getName())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .voucherType(voucher.getVoucherType() != null ? voucher.getVoucherType().name() : null)
                .discountPercent(voucher.getDiscountPercent())
                .buyQuantity(voucher.getBuyQuantity())
                .freeQuantity(voucher.getFreeQuantity())
                .minTickets(voucher.getMinTickets())
                .minimumOrderAmount(voucher.getMinimumOrderAmount())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .status(voucher.getStatus() != null ? voucher.getStatus().name() : null)
                .startTime(voucher.getStartTime() != null ? voucher.getStartTime().toString() : null)
                .endTime(voucher.getEndTime() != null ? voucher.getEndTime().toString() : null)
                .decoratorDescription(component.getDescription())
                .build();
    }

    private void mapRequestToEntity(VoucherRequest request, Voucher voucher) {
        voucher.setName(request.getName());
        voucher.setCode(request.getCode());
        voucher.setDescription(request.getDescription());
        voucher.setVoucherType(VoucherType.valueOf(request.getVoucherType()));
        voucher.setDiscountPercent(request.getDiscountPercent());
        voucher.setBuyQuantity(request.getBuyQuantity());
        voucher.setFreeQuantity(request.getFreeQuantity());
        voucher.setMinTickets(request.getMinTickets());
        voucher.setMinimumOrderAmount(request.getMinimumOrderAmount() != null ? request.getMinimumOrderAmount() : 0.0);
        voucher.setUsageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 0);
        voucher.setStartTime(parseDateTime(request.getStartTime()));
        voucher.setEndTime(parseDateTime(request.getEndTime()));
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return null;
        }
        try {
            if (dateTimeStr.contains("Z")) {
                dateTimeStr = dateTimeStr.replace("Z", "");
            }
            if (dateTimeStr.length() > 19) {
                dateTimeStr = dateTimeStr.substring(0, 19);
            }
            if (dateTimeStr.length() == 16) {
                dateTimeStr = dateTimeStr + ":00";
            }
            return LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            throw new RuntimeException("Định dạng thời gian không hợp lệ: " + dateTimeStr);
        }
    }
}
