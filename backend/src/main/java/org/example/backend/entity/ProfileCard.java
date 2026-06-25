package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "profile_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // profileCardId

    private int age;
    private String avatarUrl;      // bỏ
    private double compatibilityScore;
    private String displayName;
    private double distanceInKm;

    private boolean isVisibleToCustomer;

    private String bio;

    private boolean cineMeetEnabled;

    @OneToOne(mappedBy = "profileCard")
    private Customer ownerCustomer;

    @ManyToMany
    @JoinTable(
            name = "profile_card_genres",
            joinColumns = @JoinColumn(name = "profile_card_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> favoriteGenres;

    @ManyToOne
    @JoinColumn(name = "frequent_cinema_id")
    private Cinema frequentCinema;
}
