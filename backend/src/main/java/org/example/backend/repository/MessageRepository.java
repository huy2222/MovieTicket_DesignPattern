package org.example.backend.repository;

import org.example.backend.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByMatch_IdOrderBySentAtAsc(Long matchId);
    List<Message> findByGroupBookingSession_IdOrderBySentAtAsc(Long groupId);
    boolean existsBySharedMovie_Id(Long movieId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.match.id = :matchId AND m.sender.id != :myId AND m.isRead = false")
    void markAllAsRead(@Param("matchId") Long matchId, @Param("myId") Long myId);

    @Query("SELECT m FROM Message m WHERE m.match.id = :matchId ORDER BY m.sentAt DESC")
    List<Message> findLatestByMatchId(@Param("matchId") Long matchId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.match.id = :matchId AND m.id < :beforeId ORDER BY m.sentAt DESC")
    List<Message> findOlderByMatchId(@Param("matchId") Long matchId, @Param("beforeId") Long beforeId, Pageable pageable);
}
