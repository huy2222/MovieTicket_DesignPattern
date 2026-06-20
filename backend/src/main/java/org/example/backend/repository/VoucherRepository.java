package org.example.backend.repository;

import org.example.backend.entity.Voucher;
import org.example.backend.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    // Tìm voucher theo mã code
    Optional<Voucher> findByCode(String code);
    
    // Kiểm tra mã code đã tồn tại chưa
    boolean existsByCode(String code);
    
    // Lấy danh sách voucher theo trạng thái
    List<Voucher> findByStatus(VoucherStatus status);
    
    // Tìm voucher theo tên (chứa keyword)
    List<Voucher> findByNameContainingIgnoreCase(String name);
}
