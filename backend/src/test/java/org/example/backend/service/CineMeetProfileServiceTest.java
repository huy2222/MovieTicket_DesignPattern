package org.example.backend.service;

import org.example.backend.dto.request.CineMeetProfileRequest;
import org.example.backend.entity.Customer;
import org.example.backend.entity.ProfileCard;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GenreRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.ProfileCardRepository;
import org.example.backend.repository.SwipeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CineMeetProfileServiceTest {
    @Mock CustomerRepository customerRepository;
    @Mock ProfileCardRepository profileCardRepository;
    @Mock GenreRepository genreRepository;
    @Mock CinemaRepository cinemaRepository;
    @Mock SwipeRepository swipeRepository;
    @Mock MatchRepository matchRepository;

    private CineMeetProfileService service;

    @BeforeEach
    void setUp() {
        service = new CineMeetProfileService(
                customerRepository,
                profileCardRepository,
                genreRepository,
                cinemaRepository,
                swipeRepository,
                matchRepository
        );
    }

    @Test
    void cannotEnableCineMeetWhenMemberIsUnderEighteen() {
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setEmail("member@example.com");
        customer.setProfileCard(new ProfileCard());
        when(customerRepository.findByEmail(customer.getEmail())).thenReturn(Optional.of(customer));

        CineMeetProfileRequest request = new CineMeetProfileRequest();
        request.setDisplayName("Thành viên");
        request.setAge(17);
        request.setCineMeetEnabled(true);
        request.setVisibleToCustomer(true);
        request.setFavoriteGenreIds(List.of());

        assertThrows(
                ResponseStatusException.class,
                () -> service.saveMyProfile(customer.getEmail(), request)
        );
    }
}
