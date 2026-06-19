package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.PaymentMethod;
import org.example.backend.enums.PaymentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // paymentId

    private double amount;
    private String transactionCode; // Mã giao dịch trả về từ VNPay/MoMo
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    // Phục vụ cho thanh toán nhóm ở Phần 5
    @ManyToOne
    @JoinColumn(name = "participant_payment_id")
    private ParticipantPayment participantPayment;
}
