package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.MatchStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // matchId

    private Long conversationId;

    private LocalDateTime matchedAt;

    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_a_id")
    private Customer customerA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_b_id")
    private Customer customerB;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swipe_a_id", referencedColumnName = "id")
    private Swipe swipeA;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swipe_b_id", referencedColumnName = "id")
    private Swipe swipeB;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<Message> messages;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL)
    private List<MovieDate> movieDates;
}
