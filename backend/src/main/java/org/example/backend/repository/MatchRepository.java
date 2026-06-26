package org.example.backend.repository;

import org.example.backend.entity.Match;
import org.example.backend.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    @Query("""
            SELECT m
            FROM Match m
            WHERE m.customerA.id = :customerId OR m.customerB.id = :customerId
            ORDER BY m.matchedAt DESC
            """)
    List<Match> findAllForCustomer(@Param("customerId") Long customerId);

    @Query("""
            SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
            FROM Match m
            WHERE m.id = :matchId
              AND (m.customerA.email = :email OR m.customerB.email = :email)
            """)
    boolean canAccess(@Param("matchId") Long matchId, @Param("email") String email);

    @Query("""
            SELECT m
            FROM Match m
            WHERE m.id = :matchId
              AND m.status = :status
              AND (m.customerA.id = :customerId OR m.customerB.id = :customerId)
            """)
    Optional<Match> findOwnedByIdAndStatus(@Param("matchId") Long matchId, @Param("status") MatchStatus status, @Param("customerId") Long customerId);

    @Query("""
            SELECT m
            FROM Match m
            WHERE (m.customerA.id = :customerId AND m.customerB.id = :otherId)
               OR (m.customerA.id = :otherId AND m.customerB.id = :customerId)
            ORDER BY m.matchedAt DESC
            """)
    List<Match> findPairMatches(@Param("customerId") Long customerId, @Param("otherId") Long otherId);

    @Query("""
            SELECT m
            FROM Match m
            WHERE m.status = :status
              AND (m.customerA.id = :customerId OR m.customerB.id = :customerId)
            ORDER BY m.matchedAt DESC
            """)
    List<Match> findOwnedByStatus(@Param("customerId") Long customerId, @Param("status") MatchStatus status);

    @Query("""
            SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
            FROM Match m
            WHERE m.status IN :statuses
              AND (
                    (m.customerA.id = :customerId AND m.customerB.id = :otherId)
                 OR (m.customerA.id = :otherId AND m.customerB.id = :customerId)
              )
            """)
    boolean existsPairByStatuses(@Param("customerId") Long customerId, @Param("otherId") Long otherId, @Param("statuses") Collection<MatchStatus> statuses);
}
