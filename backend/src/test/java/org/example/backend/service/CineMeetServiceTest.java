package org.example.backend.service;

import org.example.backend.dto.response.CineMeetSwipeResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Match;
import org.example.backend.entity.ProfileCard;
import org.example.backend.entity.Swipe;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.SwipeDirection;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.LocationRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.NotificationRepository;
import org.example.backend.repository.SwipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CineMeetServiceTest {
    @Mock CustomerRepository customerRepository;
    @Mock LocationRepository locationRepository;
    @Mock SwipeRepository swipeRepository;
    @Mock MatchRepository matchRepository;
    @Mock NotificationRepository notificationRepository;
    @Mock CompatibilityService compatibilityService;

    private CineMeetService service;

    @BeforeEach
    void setUp() {
        service = new CineMeetService(
                customerRepository,
                locationRepository,
                swipeRepository,
                matchRepository,
                notificationRepository,
                compatibilityService
        );
    }

    @Test
    void reciprocalRightSwipeCreatesExactlyOneMatch() {
        Customer first = customer(1L, "first@example.com", "An");
        Customer second = customer(2L, "second@example.com", "Bình");
        Swipe reciprocal = new Swipe();
        reciprocal.setId(9L);
        reciprocal.setSwiper(second);
        reciprocal.setTarget(first);
        reciprocal.setDirection(SwipeDirection.RIGHT);

        when(customerRepository.findByEmail(first.getEmail())).thenReturn(Optional.of(first));
        when(customerRepository.findById(second.getId())).thenReturn(Optional.of(second));
        when(matchRepository.existsPairByStatuses(
                org.mockito.ArgumentMatchers.eq(first.getId()),
                org.mockito.ArgumentMatchers.eq(second.getId()),
                any()
        )).thenReturn(false);
        when(swipeRepository.findTopBySwiper_IdAndTarget_IdAndDirectionOrderBySwipedAtDesc(
                second.getId(), first.getId(), SwipeDirection.RIGHT))
                .thenReturn(Optional.of(reciprocal));
        when(swipeRepository.save(any(Swipe.class))).thenAnswer(invocation -> {
            Swipe swipe = invocation.getArgument(0);
            swipe.setId(10L);
            return swipe;
        });
        when(matchRepository.save(any(Match.class))).thenAnswer(invocation -> {
            Match match = invocation.getArgument(0);
            if (match.getId() == null) match.setId(20L);
            return match;
        });

        CineMeetSwipeResponse response = service.swipeRight(first.getEmail(), second.getId());

        assertTrue(response.isMatched());
        assertEquals(20L, response.getMatchId());
        assertEquals("RIGHT", response.getSwipeStatus());
    }

    private Customer customer(Long id, String email, String name) {
        ProfileCard profile = new ProfileCard();
        profile.setDisplayName(name);
        profile.setAge(22);
        profile.setCineMeetEnabled(true);
        profile.setVisibleToCustomer(true);
        Customer customer = new Customer();
        customer.setId(id);
        customer.setEmail(email);
        customer.setFullName(name);
        customer.setStatus(AccountStatus.ACTIVE);
        customer.setProfileCard(profile);
        return customer;
    }
}
