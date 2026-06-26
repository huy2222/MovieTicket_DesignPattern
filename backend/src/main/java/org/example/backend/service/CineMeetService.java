package org.example.backend.service;

import org.example.backend.dto.request.UpdateLocationRequest;
import org.example.backend.dto.response.CineMeetDiscoverItemResponse;
import org.example.backend.dto.response.CineMeetMatchResponse;
import org.example.backend.dto.response.CineMeetPeerResponse;
import org.example.backend.dto.response.CineMeetSwipeResponse;
import org.example.backend.dto.response.LocationResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Location;
import org.example.backend.entity.Match;
import org.example.backend.entity.Notification;
import org.example.backend.entity.Swipe;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.MatchStatus;
import org.example.backend.enums.NotificationType;
import org.example.backend.enums.SwipeDirection;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.LocationRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.NotificationRepository;
import org.example.backend.repository.SwipeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CineMeetService {

    private static final int DISCOVER_CANDIDATE_LIMIT = 10;
    private static final int DISCOVER_RESPONSE_LIMIT = 5;
    private static final double DISCOVER_RADIUS_KM = 10d;
    private static final double KM_PER_LATITUDE_DEGREE = 111.32d;
    private static final double MIN_COMPATIBILITY_SCORE = 40d;
    private static final long LEFT_SWIPE_COOLDOWN_DAYS = 3L;
    private static final Set<MatchStatus> ALL_MATCH_STATUSES = EnumSet.of(MatchStatus.ACTIVE, MatchStatus.BLOCKED, MatchStatus.CLOSED);
    private static final Set<MatchStatus> BLOCKING_DISCOVER_STATUSES = EnumSet.of(MatchStatus.ACTIVE, MatchStatus.BLOCKED, MatchStatus.CLOSED);

    private static final double FALLBACK_LATITUDE = 10.8506d;
    private static final double FALLBACK_LONGITUDE = 106.7719d;

    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    private final NotificationRepository notificationRepository;
    private final CompatibilityService compatibilityService;

    public CineMeetService(
            CustomerRepository customerRepository,
            LocationRepository locationRepository,
            SwipeRepository swipeRepository,
            MatchRepository matchRepository,
            NotificationRepository notificationRepository,
            CompatibilityService compatibilityService
    ) {
        this.customerRepository = customerRepository;
        this.locationRepository = locationRepository;
        this.swipeRepository = swipeRepository;
        this.matchRepository = matchRepository;
        this.notificationRepository = notificationRepository;
        this.compatibilityService = compatibilityService;
    }

    @Transactional(readOnly = true)
    public List<CineMeetDiscoverItemResponse> discover(String email) {
        Customer me = findCustomerByEmail(email);
        LocalDateTime leftCooldownThreshold = LocalDateTime.now().minusDays(LEFT_SWIPE_COOLDOWN_DAYS);
        Location center = me.getCurrentLocation();
        double centerLatitude = center != null ? center.getLatitude() : FALLBACK_LATITUDE;
        double centerLongitude = center != null ? center.getLongitude() : FALLBACK_LONGITUDE;
        BoundingBox box = createBoundingBox(centerLatitude, centerLongitude, DISCOVER_RADIUS_KM);

        List<CineMeetDiscoverItemResponse> items = new ArrayList<>();
        List<Customer> candidates = customerRepository.findNearbyDiscoverCandidates(
                me.getId(),
                leftCooldownThreshold,
                List.copyOf(BLOCKING_DISCOVER_STATUSES),
                box.minLatitude(),
                box.maxLatitude(),
                box.minLongitude(),
                box.maxLongitude(),
                centerLatitude,
                centerLongitude,
                PageRequest.of(0, DISCOVER_CANDIDATE_LIMIT)
        );
        for (Customer candidate : candidates) {
            double score = compatibilityService.calculateScore(me, candidate);
            if (score < MIN_COMPATIBILITY_SCORE) {
                continue;
            }

            items.add(CineMeetDiscoverItemResponse.builder()
                    .customerId(candidate.getId())
                    .avatar(resolveAvatar(candidate))
                    .name(resolveDisplayName(candidate))
                    .age(resolveAge(candidate))
                    .bio(resolveBio(candidate))
                    .distanceKm(round2(compatibilityService.distanceInKm(me, candidate)))
                    .favoriteGenres(resolveGenres(candidate))
                    .frequentCinemas(resolveFrequentCinemas(candidate))
                    .compatibilityScore(score)
                    .build());
        }

        return items.stream()
                .sorted(Comparator.comparing(CineMeetDiscoverItemResponse::getCompatibilityScore).reversed())
                .limit(DISCOVER_RESPONSE_LIMIT)
                .toList();
    }

    @Transactional
    public LocationResponse updateCurrentLocation(String email, UpdateLocationRequest request) {
        if (request == null || request.getLatitude() == null || request.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude và longitude là bắt buộc.");
        }

        Customer me = findCustomerByEmail(email);
        Location location = me.getCurrentLocation();
        if (location == null) {
            location = new Location();
        }

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAddress(request.getAddress() != null ? request.getAddress() : location.getAddress());
        location.setWard(request.getWard() != null ? request.getWard() : location.getWard());
        location.setDistrict(request.getDistrict() != null ? request.getDistrict() : location.getDistrict());
        location.setCity(request.getCity() != null ? request.getCity() : location.getCity());
        location.setCountry(request.getCountry() != null ? request.getCountry() : "Vietnam");
        location.setUpdatedAt(System.currentTimeMillis());

        Location saved = locationRepository.save(location);
        me.setCurrentLocation(saved);
        customerRepository.save(me);

        return LocationResponse.builder()
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .address(saved.getAddress())
                .ward(saved.getWard())
                .district(saved.getDistrict())
                .city(saved.getCity())
                .country(saved.getCountry())
                .build();
    }

    @Transactional
    public LocationResponse updateCurrentLocationWithFallback(String email, UpdateLocationRequest request) {
        if (request == null || request.getLatitude() == null || request.getLongitude() == null) {
            UpdateLocationRequest fallback = new UpdateLocationRequest();
            fallback.setLatitude(FALLBACK_LATITUDE);
            fallback.setLongitude(FALLBACK_LONGITUDE);
            fallback.setAddress("CGV Vincom Thủ Đức");
            fallback.setDistrict("Thủ Đức");
            fallback.setCity("TP.HCM");
            fallback.setCountry("Vietnam");
            return updateCurrentLocation(email, fallback);
        }
        return updateCurrentLocation(email, request);
    }

    @Transactional
    public CineMeetSwipeResponse swipeLeft(String email, Long targetCustomerId) {
        Customer me = findCustomerByEmail(email);
        Customer target = findCustomerById(targetCustomerId);
        validateSwipeTarget(me, target);

        Swipe swipe = new Swipe();
        swipe.setSwiper(me);
        swipe.setTarget(target);
        swipe.setDirection(SwipeDirection.LEFT);
        swipe.setSwipedAt(LocalDateTime.now());
        swipeRepository.save(swipe);

        return CineMeetSwipeResponse.builder()
                .swipeStatus("LEFT")
                .matched(false)
                .message("Đã bỏ qua hồ sơ này.")
                .build();
    }

    @Transactional
    public CineMeetSwipeResponse swipeRight(String email, Long targetCustomerId) {
        Customer me = findCustomerByEmail(email);
        Customer target = findCustomerById(targetCustomerId);
        validateSwipeTarget(me, target);

        if (matchRepository.existsPairByStatuses(me.getId(), target.getId(), ALL_MATCH_STATUSES)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hai người đã có trạng thái match trước đó.");
        }

        Swipe mySwipe = new Swipe();
        mySwipe.setSwiper(me);
        mySwipe.setTarget(target);
        mySwipe.setDirection(SwipeDirection.RIGHT);
        mySwipe.setSwipedAt(LocalDateTime.now());
        mySwipe = swipeRepository.save(mySwipe);

        Swipe oppositeSwipe = swipeRepository
                .findTopBySwiper_IdAndTarget_IdAndDirectionOrderBySwipedAtDesc(target.getId(), me.getId(), SwipeDirection.RIGHT)
                .orElse(null);

        if (oppositeSwipe == null) {
            return CineMeetSwipeResponse.builder()
                    .swipeStatus("RIGHT")
                    .matched(false)
                    .message("Đã ghi nhận quan tâm. Chờ đối phương phản hồi.")
                    .build();
        }

        Match match = new Match();
        match.setCustomerA(me);
        match.setCustomerB(target);
        match.setSwipeA(mySwipe);
        match.setSwipeB(oppositeSwipe);
        match.setMatchedAt(LocalDateTime.now());
        match.setStatus(MatchStatus.ACTIVE);
        match.setConversationId(generateConversationId(me.getId(), target.getId()));
        Match savedMatch = matchRepository.save(match);

        createMatchNotifications(me, target);

        return CineMeetSwipeResponse.builder()
                .swipeStatus("RIGHT")
                .matched(true)
                .matchId(savedMatch.getId())
                .conversationId(savedMatch.getConversationId())
                .message("It's a Match!")
                .build();
    }

    @Transactional
    public CineMeetMatchResponse blockMatch(String email, Long matchId) {
        Customer me = findCustomerByEmail(email);
        Match match = findOwnedActiveMatch(matchId, me.getId());
        match.setStatus(MatchStatus.BLOCKED);
        Match saved = matchRepository.save(match);
        return toMatchResponse(saved, me);
    }

    @Transactional
    public CineMeetMatchResponse closeMatch(String email, Long matchId) {
        Customer me = findCustomerByEmail(email);
        Match match = findOwnedActiveMatch(matchId, me.getId());
        match.setStatus(MatchStatus.CLOSED);
        Match saved = matchRepository.save(match);
        return toMatchResponse(saved, me);
    }

    @Transactional(readOnly = true)
    public List<CineMeetMatchResponse> getMatches(String email) {
        Customer me = findCustomerByEmail(email);
        return matchRepository.findOwnedByStatus(me.getId(), MatchStatus.ACTIVE).stream()
                .map(match -> toMatchResponse(match, me))
                .toList();
    }

    @Transactional(readOnly = true)
    public CineMeetMatchResponse getMatchById(String email, Long matchId) {
        Customer me = findCustomerByEmail(email);
        Match match = matchRepository.findById(matchId)
                .filter(it -> it.getCustomerA().getId().equals(me.getId()) || it.getCustomerB().getId().equals(me.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy match."));
        return toMatchResponse(match, me);
    }

    private boolean isDiscoverCandidate(Customer me, Customer candidate, LocalDateTime leftCooldownThreshold) {
        if (candidate.getId().equals(me.getId())) {
            return false;
        }
        if (candidate.getStatus() != AccountStatus.ACTIVE) {
            return false;
        }
        if (candidate.getProfileCard() == null || !candidate.getProfileCard().isCineMeetEnabled()) {
            return false;
        }
        if (isLeftSwipedRecently(me.getId(), candidate.getId(), leftCooldownThreshold)) {
            return false;
        }
        return !matchRepository.existsPairByStatuses(me.getId(), candidate.getId(), BLOCKING_DISCOVER_STATUSES);
    }

    private boolean isLeftSwipedRecently(Long meId, Long candidateId, LocalDateTime threshold) {
        return swipeRepository.findTopBySwiper_IdAndTarget_IdAndDirectionOrderBySwipedAtDesc(meId, candidateId, SwipeDirection.LEFT)
                .map(s -> s.getSwipedAt() != null && s.getSwipedAt().isAfter(threshold))
                .orElse(false);
    }

    private void validateSwipeTarget(Customer me, Customer target) {
        if (target.getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể swipe chính mình.");
        }
        if (target.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản mục tiêu hiện không hoạt động.");
        }
    }

    private Match findOwnedActiveMatch(Long matchId, Long meId) {
        return matchRepository.findOwnedByIdAndStatus(matchId, MatchStatus.ACTIVE, meId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match không tồn tại hoặc không còn ACTIVE."));
    }

    private CineMeetMatchResponse toMatchResponse(Match match, Customer me) {
        Customer peer = match.getCustomerA().getId().equals(me.getId()) ? match.getCustomerB() : match.getCustomerA();

        return CineMeetMatchResponse.builder()
                .matchId(match.getId())
                .conversationId(match.getConversationId())
                .status(match.getStatus())
                .matchedAt(match.getMatchedAt())
                .peer(CineMeetPeerResponse.builder()
                        .customerId(peer.getId())
                        .avatar(resolveAvatar(peer))
                        .name(resolveDisplayName(peer))
                        .age(resolveAge(peer))
                        .build())
                .favoriteGenres(resolveGenres(peer))
                .frequentCinemas(resolveFrequentCinemas(peer))
                .build();
    }

    private void createMatchNotifications(Customer me, Customer target) {
        Notification mine = new Notification();
        mine.setUser(me);
        mine.setTitle("It's a Match!");
        mine.setContent("Bạn và " + resolveDisplayName(target) + " đã quan tâm lẫn nhau.");
        mine.setType(NotificationType.CINEMEET_MATCH);
        mine.setSentAt(LocalDateTime.now());
        mine.setRead(false);

        Notification theirs = new Notification();
        theirs.setUser(target);
        theirs.setTitle("It's a Match!");
        theirs.setContent("Bạn và " + resolveDisplayName(me) + " đã quan tâm lẫn nhau.");
        theirs.setType(NotificationType.CINEMEET_MATCH);
        theirs.setSentAt(LocalDateTime.now());
        theirs.setRead(false);

        notificationRepository.save(mine);
        notificationRepository.save(theirs);
    }

    private Long generateConversationId(Long first, Long second) {
        long min = Math.min(first, second);
        long max = Math.max(first, second);
        return (min * 1_000_000_000L) + max;
    }

    private Customer findCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không xác thực được người dùng."));
    }

    private Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng mục tiêu."));
    }

    private String resolveAvatar(Customer customer) {
        if (customer.getProfileCard() != null && customer.getProfileCard().getAvatarUrl() != null
                && !customer.getProfileCard().getAvatarUrl().isBlank()) {
            return customer.getProfileCard().getAvatarUrl();
        }
        return customer.getAvatarUrl();
    }

    private String resolveDisplayName(Customer customer) {
        if (customer.getProfileCard() != null && customer.getProfileCard().getDisplayName() != null
                && !customer.getProfileCard().getDisplayName().isBlank()) {
            return customer.getProfileCard().getDisplayName();
        }
        return customer.getFullName();
    }

    private Integer resolveAge(Customer customer) {
        if (customer.getProfileCard() != null) {
            return customer.getProfileCard().getAge();
        }
        return null;
    }

    private String resolveBio(Customer customer) {
        if (customer.getProfileCard() != null && customer.getProfileCard().getBio() != null
                && !customer.getProfileCard().getBio().isBlank()) {
            return customer.getProfileCard().getBio();
        }
        return null;
    }

    private List<String> resolveGenres(Customer customer) {
        Set<String> genres = new LinkedHashSet<>();
        if (customer.getFavoriteGenres() != null) {
            customer.getFavoriteGenres().stream()
                    .map(Genre::getName)
                    .forEach(genres::add);
        }
        if (customer.getProfileCard() != null && customer.getProfileCard().getFavoriteGenres() != null) {
            customer.getProfileCard().getFavoriteGenres().stream()
                    .map(Genre::getName)
                    .forEach(genres::add);
        }
        if (customer.getMovieHistories() != null) {
            customer.getMovieHistories().stream()
                    .filter(history -> history.getMovie() != null && history.getMovie().getGenres() != null)
                    .flatMap(history -> history.getMovie().getGenres().stream())
                    .map(Genre::getName)
                    .forEach(genres::add);
        }
        return List.copyOf(genres);
    }

    private List<String> resolveFrequentCinemas(Customer customer) {
        Set<String> cinemas = new LinkedHashSet<>();
        if (customer.getFrequentCinemas() != null) {
            customer.getFrequentCinemas().stream()
                    .map(cinema -> cinema.getName())
                    .forEach(cinemas::add);
        }
        if (customer.getProfileCard() != null && customer.getProfileCard().getFrequentCinema() != null) {
            cinemas.add(customer.getProfileCard().getFrequentCinema().getName());
        }
        return List.copyOf(cinemas);
    }

    private double round2(double value) {
        return Math.round(value * 100d) / 100d;
    }

    private BoundingBox createBoundingBox(double latitude, double longitude, double radiusKm) {
        double latitudeDelta = radiusKm / KM_PER_LATITUDE_DEGREE;
        double cosLatitude = Math.cos(Math.toRadians(latitude));
        double longitudeDelta = Math.abs(cosLatitude) < 0.000001d
                ? 180d
                : radiusKm / (KM_PER_LATITUDE_DEGREE * Math.abs(cosLatitude));

        return new BoundingBox(
                clampLatitude(latitude - latitudeDelta),
                clampLatitude(latitude + latitudeDelta),
                clampLongitude(longitude - longitudeDelta),
                clampLongitude(longitude + longitudeDelta)
        );
    }

    private double clampLatitude(double latitude) {
        return Math.max(-90d, Math.min(90d, latitude));
    }

    private double clampLongitude(double longitude) {
        if (longitude < -180d) {
            return -180d;
        }
        if (longitude > 180d) {
            return 180d;
        }
        return longitude;
    }

    private record BoundingBox(double minLatitude, double maxLatitude, double minLongitude, double maxLongitude) {
    }
}
