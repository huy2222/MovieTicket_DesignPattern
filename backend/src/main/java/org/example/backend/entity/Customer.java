package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Customer extends User{
    private int loyaltyPoints;

    // Mối quan hệ với ProfileCard (1 - 1)
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_card_id", referencedColumnName = "id")
    private ProfileCard profileCard;



    @ManyToOne
    @JoinColumn(name = "current_location_id")
    private Location currentLocation;

    @ManyToOne
    @JoinColumn(name = "frequent_cinema_id")
    private Cinema frequentCinema;

    @ManyToMany
    @JoinTable(
            name = "customer_favorite_genres",
            joinColumns = @JoinColumn(name = "customer_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> favoriteGenres;

    @OneToMany(mappedBy = "customer")
    private List<Booking> bookings;

    @OneToMany(mappedBy = "customer")
    private List<MovieHistory> movieHistories;

    @OneToMany(mappedBy = "customer")
    private List<Review> reviews;

    @OneToMany(mappedBy = "customer")
    private List<Ticket> tickets;

    //
    @ManyToMany(mappedBy = "participants")
    private List<GroupBookingSession> groupBookingSessions;


    @OneToMany(mappedBy = "proposer", cascade = CascadeType.ALL)
    private List<MovieDate> movieDates;

    @OneToMany(mappedBy = "swiper", cascade = CascadeType.ALL)
    private List<Swipe> swipes;

    @OneToMany(mappedBy = "customerA", cascade = CascadeType.ALL)
    private List<Match> matchesAsA;

    @OneToMany(mappedBy = "customerB", cascade = CascadeType.ALL)
    private List<Match> matchesAsB;



}
