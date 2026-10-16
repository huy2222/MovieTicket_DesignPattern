package org.example.backend.repository;

import org.example.backend.entity.GroupBookingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupBookingSessionRepository extends JpaRepository<GroupBookingSession, Long> {
    boolean existsByInvitation_Id(Long invitationId);

    @Query("""
            select distinct g from GroupBookingSession g
            join g.participants p
            left join fetch g.showtime s
            left join fetch s.movie
            left join fetch s.cinema
            left join fetch s.room
            left join fetch g.match
            left join fetch g.invitation
            where p.id = :customerId
            order by g.createdAt desc
            """)
    List<GroupBookingSession> findAllForCustomer(@Param("customerId") Long customerId);

    @Query("""
            select distinct g from GroupBookingSession g
            join g.participants p
            left join fetch g.showtime s
            left join fetch s.movie
            left join fetch s.cinema
            left join fetch s.room
            left join fetch g.match
            left join fetch g.invitation
            where g.match.id = :matchId and p.id = :customerId
            order by g.createdAt desc
            """)
    List<GroupBookingSession> findForMatchAndCustomer(
            @Param("matchId") Long matchId,
            @Param("customerId") Long customerId);

    @Query("""
            select distinct g from GroupBookingSession g
            join g.participants p
            left join fetch g.showtime s
            left join fetch s.movie
            left join fetch s.cinema
            left join fetch s.room
            left join fetch g.match
            left join fetch g.invitation
            where g.id = :groupId and p.id = :customerId
            """)
    Optional<GroupBookingSession> findAccessible(
            @Param("groupId") Long groupId,
            @Param("customerId") Long customerId);

    @Query("""
            select count(g) > 0 from GroupBookingSession g
            join g.participants p
            where g.id = :groupId and p.email = :email
            """)
    boolean canAccess(@Param("groupId") Long groupId, @Param("email") String email);
}
