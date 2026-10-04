package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ComboFulfillmentStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_combos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "combo_id", nullable = false)
    private Combo combo;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_status", nullable = false)
    private ComboFulfillmentStatus fulfillmentStatus;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "received_by_staff_id")
    private Staff receivedByStaff;
}

