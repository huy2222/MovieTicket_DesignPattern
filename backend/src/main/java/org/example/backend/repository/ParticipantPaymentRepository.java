package org.example.backend.repository;

import org.example.backend.entity.ParticipantPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ParticipantPaymentRepository extends JpaRepository<ParticipantPayment, Long> {
    Optional<ParticipantPayment> findByGroupBookingSession_IdAndCustomer_Id(Long groupId, Long customerId);
    List<ParticipantPayment> findByGroupBookingSession_Id(Long groupId);

    @Query("""
            select p from ParticipantPayment p
            join fetch p.customer c
            left join fetch c.profileCard
            left join fetch p.seat
            left join fetch p.seatHold
            where p.groupBookingSession.id = :groupId
            """)
    List<ParticipantPayment> findByGroupIdWithDetails(@Param("groupId") Long groupId);

    @Query("""
            select p from ParticipantPayment p
            join fetch p.customer c
            left join fetch c.profileCard
            left join fetch p.seat
            left join fetch p.seatHold
            where p.groupBookingSession.id = :groupId and c.id = :customerId
            """)
    Optional<ParticipantPayment> findByGroupIdAndCustomerIdWithDetails(
            @Param("groupId") Long groupId,
            @Param("customerId") Long customerId);
}
