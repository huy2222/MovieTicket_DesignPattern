package org.example.backend.repository;

import org.example.backend.entity.Voucher;
import org.example.backend.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT COUNT(v) > 0 FROM Voucher v JOIN v.applicableMovies m WHERE m.id = :movieId")
    boolean existsByApplicableMovieId(@Param("movieId") Long movieId);

    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' " +
           "AND (v.startTime IS NULL OR v.startTime <= :now) " +
           "AND (v.endTime IS NULL OR v.endTime >= :now) " +
           "AND v.minimumOrderAmount <= :originalPrice")
    List<Voucher> findApplicableVouchers(@Param("now") java.time.LocalDateTime now, @Param("originalPrice") double originalPrice);
}
