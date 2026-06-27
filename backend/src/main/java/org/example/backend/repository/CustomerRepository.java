package org.example.backend.repository;

import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.entity.Customer;
import org.example.backend.enums.MatchStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);

    long count();
    List<Customer> findAll();
    @Query("""
        SELECT new org.example.backend.dto.response.CustomerResponseAdmin(
            c.id,
            c.email,
            c.fullName,
            c.status,
            c.createdAt
        )
        FROM Customer c
        """)
    List<CustomerResponseAdmin> getCustomersForAdmin();

    @Query("""
        SELECT c FROM Customer c
        JOIN c.currentLocation loc
        WHERE c.id != :myId
          AND c.status = org.example.backend.enums.AccountStatus.ACTIVE
          AND c.profileCard IS NOT NULL
          AND c.profileCard.cineMeetEnabled = true
          AND loc.latitude BETWEEN :minLatitude AND :maxLatitude
          AND loc.longitude BETWEEN :minLongitude AND :maxLongitude
          AND c.id NOT IN (
              SELECT s.target.id FROM Swipe s
              WHERE s.swiper.id = :myId
                AND (
                    s.direction = org.example.backend.enums.SwipeDirection.RIGHT
                    OR (s.direction = org.example.backend.enums.SwipeDirection.LEFT AND s.swipedAt > :leftSwipeThreshold)
                )
          )
          AND c.id NOT IN (
              SELECT m.customerA.id FROM Match m
              WHERE m.customerB.id = :myId
                AND m.status IN :blockingStatuses
          )
          AND c.id NOT IN (
              SELECT m.customerB.id FROM Match m
              WHERE m.customerA.id = :myId
                AND m.status IN :blockingStatuses
          )
        ORDER BY ((loc.latitude - :centerLatitude) * (loc.latitude - :centerLatitude))
               + ((loc.longitude - :centerLongitude) * (loc.longitude - :centerLongitude)) ASC
    """)
    List<Customer> findNearbyDiscoverCandidates(
        @Param("myId") Long myId,
        @Param("leftSwipeThreshold") LocalDateTime leftSwipeThreshold,
        @Param("blockingStatuses") List<MatchStatus> blockingStatuses,
        @Param("minLatitude") double minLatitude,
        @Param("maxLatitude") double maxLatitude,
        @Param("minLongitude") double minLongitude,
        @Param("maxLongitude") double maxLongitude,
        @Param("centerLatitude") double centerLatitude,
        @Param("centerLongitude") double centerLongitude,
        Pageable pageable
    );
}
