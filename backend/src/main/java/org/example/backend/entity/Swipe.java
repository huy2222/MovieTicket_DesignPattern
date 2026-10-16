package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.SwipeDirection;

import java.time.LocalDateTime;

@Entity
@Table(name = "swipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Swipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // swipeId

    @Enumerated(EnumType.STRING)
    private SwipeDirection direction;



    private LocalDateTime swipedAt;

    @ManyToOne
    @JoinColumn(name = "swiper_id")
    private Customer swiper;

    @ManyToOne
    @JoinColumn(name = "target_id")
    private Customer target;
}
