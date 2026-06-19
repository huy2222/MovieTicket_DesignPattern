package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "participant_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // participantPaymentId

    private double amount;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "group_booking_session_id")
    private GroupBookingSession groupBookingSession;

    @ManyToOne
    @JoinColumn(name = "seat_hold_id")
    private SeatHold seatHold;

    // TODO: Liên kết với Payment nếu cần chi tiết giao dịch cụ thể
    @OneToMany(mappedBy = "participantPayment")
    private List<Payment> payments;
}
