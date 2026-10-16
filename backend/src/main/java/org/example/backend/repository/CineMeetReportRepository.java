package org.example.backend.repository;

import org.example.backend.entity.CineMeetReport;
import org.example.backend.enums.CineMeetReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CineMeetReportRepository extends JpaRepository<CineMeetReport, Long> {
    boolean existsByReporter_IdAndReportedUser_IdAndReportedMessageIsNullAndStatusIn(
            Long reporterId,
            Long reportedUserId,
            Collection<CineMeetReportStatus> statuses
    );

    boolean existsByReporter_IdAndReportedMessage_IdAndStatusIn(
            Long reporterId,
            Long messageId,
            Collection<CineMeetReportStatus> statuses
    );

    List<CineMeetReport> findAllByOrderByCreatedAtDesc();

    List<CineMeetReport> findByStatusOrderByCreatedAtDesc(CineMeetReportStatus status);

    List<CineMeetReport> findByReporter_EmailOrderByCreatedAtDesc(String email);

    boolean existsByReporter_IdAndReportedUser_Id(Long reporterId, Long reportedUserId);

    @Query("SELECT DISTINCT r.reportedUser.id FROM CineMeetReport r WHERE r.reporter.id = :reporterId")
    List<Long> findReportedUserIdsByReporterId(@Param("reporterId") Long reporterId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM CineMeetReport r WHERE r.id = :id")
    Optional<CineMeetReport> findLockedById(@Param("id") Long id);
}
