package org.example.backend.service;

import org.example.backend.dto.request.CineMeetProfileRequest;
import org.example.backend.dto.response.CineMeetProfileResponse;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Genre;
import org.example.backend.entity.ProfileCard;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GenreRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.ProfileCardRepository;
import org.example.backend.repository.SwipeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CineMeetProfileService {
    private final CustomerRepository customerRepository;
    private final ProfileCardRepository profileCardRepository;
    private final GenreRepository genreRepository;
    private final CinemaRepository cinemaRepository;
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;

    public CineMeetProfileService(
            CustomerRepository customerRepository,
            ProfileCardRepository profileCardRepository,
            GenreRepository genreRepository,
            CinemaRepository cinemaRepository,
            SwipeRepository swipeRepository,
            MatchRepository matchRepository
    ) {
        this.customerRepository = customerRepository;
        this.profileCardRepository = profileCardRepository;
        this.genreRepository = genreRepository;
        this.cinemaRepository = cinemaRepository;
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
    }

    @Transactional(readOnly = true)
    public CineMeetProfileResponse getMyProfile(String email) {
        Customer customer = findCustomer(email);
        return toResponse(customer, customer);
    }

    @Transactional
    public CineMeetProfileResponse saveMyProfile(String email, CineMeetProfileRequest request) {
        Customer customer = findCustomer(email);
        ProfileCard profile = customer.getProfileCard();
        if (profile == null) {
            profile = new ProfileCard();
            profile.setOwnerCustomer(customer);
            customer.setProfileCard(profile);
        }

        String displayName = request.getDisplayName() == null ? "" : request.getDisplayName().trim();
        int age = request.getAge() == null ? profile.getAge() : request.getAge();
        boolean enable = request.getCineMeetEnabled() == null
                ? profile.isCineMeetEnabled()
                : request.getCineMeetEnabled();
        boolean visible = request.getVisibleToCustomer() == null
                ? profile.isVisibleToCustomer()
                : request.getVisibleToCustomer();

        if (displayName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên hiển thị là bắt buộc");
        }
        if (age < 18 || age > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CineMeet chỉ dành cho thành viên từ 18 tuổi");
        }

        List<Genre> genres = request.getFavoriteGenreIds() == null
                ? profile.getFavoriteGenres()
                : genreRepository.findAllById(request.getFavoriteGenreIds());
        Cinema cinema = request.getFrequentCinemaId() == null
                ? profile.getFrequentCinema()
                : cinemaRepository.findById(request.getFrequentCinemaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy rạp thường đến"));

        if (enable && (genres == null || genres.isEmpty())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn ít nhất một thể loại yêu thích trước khi bật CineMeet"
            );
        }

        profile.setDisplayName(displayName);
        profile.setAge(age);
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        if (request.getBio() != null) profile.setBio(trimToNull(request.getBio()));
        profile.setFavoriteGenres(genres == null ? List.of() : genres);
        profile.setFrequentCinema(cinema);
        profile.setCineMeetEnabled(enable);
        profile.setVisibleToCustomer(enable && visible);
        ProfileCard saved = profileCardRepository.save(profile);
        customer.setProfileCard(saved);
        customerRepository.save(customer);
        return toResponse(customer, customer);
    }

    @Transactional(readOnly = true)
    public List<CineMeetProfileResponse> discover(String email) {
        Customer current = findCustomer(email);
        ProfileCard myProfile = current.getProfileCard();
        if (myProfile == null || !myProfile.isCineMeetEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn cần hoàn thiện và bật hồ sơ CineMeet");
        }

        Set<Long> excluded = new HashSet<>();
        excluded.add(current.getId());
        swipeRepository.findBySwiper_Id(current.getId())
                .forEach(swipe -> excluded.add(swipe.getTarget().getId()));
        matchRepository.findAllForCustomer(current.getId()).forEach(match -> {
            excluded.add(match.getCustomerA().getId());
            excluded.add(match.getCustomerB().getId());
        });

        return customerRepository.findAll().stream()
                .filter(candidate -> !excluded.contains(candidate.getId()))
                .filter(candidate -> candidate.getProfileCard() != null)
                .filter(candidate -> candidate.getProfileCard().isCineMeetEnabled())
                .filter(candidate -> candidate.getProfileCard().isVisibleToCustomer())
                .map(candidate -> toResponse(candidate, current))
                .toList();
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
    }

    private CineMeetProfileResponse toResponse(Customer customer, Customer viewer) {
        ProfileCard profile = customer.getProfileCard();
        if (profile == null) {
            return CineMeetProfileResponse.builder()
                    .customerId(customer.getId())
                    .displayName(customer.getFullName())
                    .favoriteGenres(List.of())
                    .build();
        }

        double compatibility = calculateCompatibility(viewer.getProfileCard(), profile);
        return CineMeetProfileResponse.builder()
                .customerId(customer.getId())
                .profileId(profile.getId())
                .displayName(profile.getDisplayName())
                .age(profile.getAge())
                .avatarUrl(profile.getAvatarUrl())
                .bio(profile.getBio())
                .cineMeetEnabled(profile.isCineMeetEnabled())
                .visibleToCustomer(profile.isVisibleToCustomer())
                .compatibilityScore(compatibility)
                .distanceInKm(profile.getDistanceInKm())
                .frequentCinemaId(profile.getFrequentCinema() != null ? profile.getFrequentCinema().getId() : null)
                .frequentCinemaName(profile.getFrequentCinema() != null ? profile.getFrequentCinema().getName() : null)
                .favoriteGenres(profile.getFavoriteGenres() == null ? List.of() :
                        profile.getFavoriteGenres().stream()
                                .map(genre -> CineMeetProfileResponse.GenreItem.builder()
                                        .id(genre.getId())
                                        .name(genre.getName())
                                        .build())
                                .toList())
                .build();
    }

    private double calculateCompatibility(ProfileCard mine, ProfileCard other) {
        if (mine == null || mine.getFavoriteGenres() == null || mine.getFavoriteGenres().isEmpty()
                || other.getFavoriteGenres() == null || other.getFavoriteGenres().isEmpty()) {
            return 0;
        }
        Set<Long> mineIds = mine.getFavoriteGenres().stream().map(Genre::getId).collect(java.util.stream.Collectors.toSet());
        long common = other.getFavoriteGenres().stream().map(Genre::getId).filter(mineIds::contains).count();
        long total = mineIds.size() + other.getFavoriteGenres().size() - common;
        return total == 0 ? 0 : Math.round(common * 10000.0 / total) / 100.0;
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
