package org.example.backend.config;

import org.example.backend.entity.Cinema;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Match;
import org.example.backend.entity.ProfileCard;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.MatchStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GenreRepository;
import org.example.backend.repository.MatchRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(100)
public class CineMeetDemoDataInitializer implements CommandLineRunner {
    public static final String FIRST_EMAIL = "cinemeet.an@example.com";
    public static final String SECOND_EMAIL = "cinemeet.binh@example.com";
    public static final String DEMO_PASSWORD = "demo123";

    private final CustomerRepository customerRepository;
    private final GenreRepository genreRepository;
    private final CinemaRepository cinemaRepository;
    private final MatchRepository matchRepository;
    private final PasswordEncoder passwordEncoder;

    public CineMeetDemoDataInitializer(
            CustomerRepository customerRepository,
            GenreRepository genreRepository,
            CinemaRepository cinemaRepository,
            MatchRepository matchRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.genreRepository = genreRepository;
        this.cinemaRepository = cinemaRepository;
        this.matchRepository = matchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            initializeDemoData();
        } catch (RuntimeException ex) {
            System.out.println("[CineMeet Demo] Skipped because database is temporarily unavailable: "
                    + ex.getMessage());
        }
    }

    private void initializeDemoData() {
        List<Genre> genres = genreRepository.findAll().stream().limit(3).toList();
        Cinema cinema = cinemaRepository.findAll().stream().findFirst().orElse(null);

        Customer first = ensureCustomer(
                FIRST_EMAIL,
                "Nguyễn An",
                "An mê phim",
                24,
                "Thích phim hành động, cuối tuần thường đi xem phim.",
                "https://i.pravatar.cc/200?img=12",
                genres,
                cinema
        );
        Customer second = ensureCustomer(
                SECOND_EMAIL,
                "Trần Bình",
                "Bình điện ảnh",
                23,
                "Fan khoa học viễn tưởng và những buổi chiếu tối.",
                "https://i.pravatar.cc/200?img=5",
                genres,
                cinema
        );

        if (matchRepository.findPairMatches(first.getId(), second.getId()).isEmpty()) {
            Match match = new Match();
            match.setCustomerA(first);
            match.setCustomerB(second);
            match.setMatchedAt(LocalDateTime.now());
            match.setStatus(MatchStatus.ACTIVE);
            match.setConversationId((Math.min(first.getId(), second.getId()) * 1_000_000_000L)
                    + Math.max(first.getId(), second.getId()));
            matchRepository.save(match);
        }
    }

    private Customer ensureCustomer(
            String email,
            String fullName,
            String displayName,
            int age,
            String bio,
            String avatarUrl,
            List<Genre> genres,
            Cinema cinema
    ) {
        Customer customer = customerRepository.findByEmail(email).orElseGet(Customer::new);
        boolean isNew = customer.getId() == null;
        customer.setEmail(email);
        customer.setFullName(fullName);
        customer.setPhoneNumber(isNew ? "0900000000" : customer.getPhoneNumber());
        customer.setPasswordHash(isNew
                ? passwordEncoder.encode(DEMO_PASSWORD)
                : customer.getPasswordHash());
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(AccountStatus.ACTIVE);
        if (customer.getCreatedAt() == null) customer.setCreatedAt(LocalDateTime.now());

        ProfileCard profile = customer.getProfileCard();
        if (profile == null) profile = new ProfileCard();
        profile.setDisplayName(displayName);
        profile.setAge(age);
        profile.setBio(bio);
        profile.setAvatarUrl(avatarUrl);
        profile.setCineMeetEnabled(true);
        profile.setVisibleToCustomer(true);
        profile.setCompatibilityScore(100);
        profile.setFavoriteGenres(new ArrayList<>(genres));
        profile.setFrequentCinema(cinema);
        profile.setOwnerCustomer(customer);
        customer.setProfileCard(profile);
        return customerRepository.save(customer);
    }
}
