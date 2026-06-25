package org.example.backend.repository;

import org.example.backend.entity.Swipe;
import org.example.backend.enums.SwipeDirection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SwipeRepository extends JpaRepository<Swipe, Long> {
    Optional<Swipe> findTopBySwiper_IdAndTarget_IdOrderBySwipedAtDesc(Long swiperId, Long targetId);
    Optional<Swipe> findTopBySwiper_IdAndTarget_IdAndDirectionOrderBySwipedAtDesc(Long swiperId, Long targetId, SwipeDirection direction);
    List<Swipe> findBySwiper_IdAndDirectionAndSwipedAtAfter(Long swiperId, SwipeDirection direction, LocalDateTime swipedAt);
}
