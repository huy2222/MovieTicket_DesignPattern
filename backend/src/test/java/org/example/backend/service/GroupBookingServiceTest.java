package org.example.backend.service;

import org.example.backend.entity.Customer;
import org.example.backend.entity.GroupBookingSession;
import org.example.backend.entity.Match;
import org.example.backend.entity.MovieDate;
import org.example.backend.entity.ParticipantPayment;
import org.example.backend.entity.Showtime;
import org.example.backend.enums.GroupBookingStatus;
import org.example.backend.repository.BookingRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GroupBookingSessionRepository;
import org.example.backend.repository.ParticipantPaymentRepository;
import org.example.backend.repository.SeatHoldRepository;
import org.example.backend.repository.SeatRepository;
import org.example.backend.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupBookingServiceTest {
    @Mock GroupBookingSessionRepository groupRepository;
    @Mock ParticipantPaymentRepository participantRepository;
    @Mock CustomerRepository customerRepository;
    @Mock SeatRepository seatRepository;
    @Mock SeatHoldRepository seatHoldRepository;
    @Mock TicketRepository ticketRepository;
    @Mock BookingRepository bookingRepository;
    @Mock CineMeetRealtimePublisher realtimePublisher;

    private GroupBookingService service;

    @BeforeEach
    void setUp() {
        service = new GroupBookingService(
                groupRepository,
                participantRepository,
                customerRepository,
                seatRepository,
                seatHoldRepository,
                ticketRepository,
                bookingRepository,
                realtimePublisher
        );
    }

    @Test
    void acceptedInvitationCreatesTwoMemberWaitingGroup() {
        Customer first = new Customer();
        first.setId(1L);
        Customer second = new Customer();
        second.setId(2L);
        Match match = new Match();
        match.setId(5L);
        match.setCustomerA(first);
        match.setCustomerB(second);
        Showtime showtime = new Showtime();
        showtime.setId(8L);
        showtime.setBasePrice(90_000);
        showtime.setStartTime(LocalDateTime.now().plusDays(1));
        MovieDate invitation = new MovieDate();
        invitation.setId(10L);
        invitation.setShowtime(showtime);

        when(groupRepository.existsByInvitation_Id(invitation.getId())).thenReturn(false);
        when(groupRepository.save(any(GroupBookingSession.class))).thenAnswer(invocation -> {
            GroupBookingSession group = invocation.getArgument(0);
            group.setId(20L);
            return group;
        });
        AtomicInteger memberCount = new AtomicInteger();
        when(participantRepository.saveAll(any())).thenAnswer(invocation -> {
            List<ParticipantPayment> members = invocation.getArgument(0);
            memberCount.addAndGet(members.size());
            return members;
        });

        GroupBookingSession result = service.createFromInvitation(invitation, match);

        assertEquals(GroupBookingStatus.WAITING, result.getStatus());
        assertEquals(2, result.getParticipants().size());
        assertEquals(2, memberCount.get());
        verify(groupRepository).save(any(GroupBookingSession.class));
    }
}
