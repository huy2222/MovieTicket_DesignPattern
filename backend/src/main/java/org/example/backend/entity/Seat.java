package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.SeatStatus;
import org.example.backend.enums.SeatType;

import java.util.List;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // seatId

    private int columnNumber;
    private String rowLabel; // VD: A, B, C

    @Enumerated(EnumType.STRING)
    private SeatType seatType;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;


    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL) // Đổi thành OneToMany
    private List<Ticket> tickets;

    @OneToMany(mappedBy = "seat")
    private List<SeatHold> seatHolds;
}
