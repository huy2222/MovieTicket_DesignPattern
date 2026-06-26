package org.example.backend.service;

import org.example.backend.dto.request.MovieInvitationRequest;
import org.example.backend.dto.response.MovieInvitationResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.GroupBookingSession;
import org.example.backend.entity.Match;
import org.example.backend.entity.MovieDate;
import org.example.backend.entity.Showtime;
import org.example.backend.enums.MatchStatus;
import org.example.backend.enums.MovieDateStatus;
import org.example.backend.enums.ShowtimeStatus;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.MovieDateRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovieInvitationService {
    private final CustomerRepository customerRepository;
    private final MatchRepository matchRepository;
    private final MovieDateRepository invitationRepository;
    private final ShowtimeRepository showtimeRepository;
    private final GroupBookingService groupBookingService;
    private final CineMeetRealtimePublisher realtimePublisher;

    public MovieInvitationService(
            CustomerRepository customerRepository,
            MatchRepository matchRepository,
            MovieDateRepository invitationRepository,
            ShowtimeRepository showtimeRepository,
            GroupBookingService groupBookingService,
            CineMeetRealtimePublisher realtimePublisher
    ) {
        this.customerRepository = customerRepository;
        this.matchRepository = matchRepository;
        this.invitationRepository = invitationRepository;
        this.showtimeRepository = showtimeRepository;
        this.groupBookingService = groupBookingService;
        this.realtimePublisher = realtimePublisher;
    }

    @Transactional(readOnly = true)
    public List<MovieInvitationResponse> getInvitations(String email, Long matchId) {
        Customer customer = findCustomer(email);
        Match match = findAccessibleMatch(matchId, customer);
        return invitationRepository.findByMatch_IdOrderByProposedAtDesc(match.getId()).stream()
                .map(invitation -> toResponse(invitation, customer))
                .toList();
    }

    @Transactional
    public MovieInvitationResponse createInvitation(
            String email, Long matchId, MovieInvitationRequest request) {
        Customer proposer = findCustomer(email);
        Match match = findAccessibleMatch(matchId, proposer);
        requireActiveMatch(match);
        requireCineMeetEnabled(match.getCustomerA());
        requireCineMeetEnabled(match.getCustomerB());

        if (invitationRepository.findFirstByMatch_IdAndStatusOrderByProposedAtDesc(
                matchId, MovieDateStatus.PROPOSED).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đang có một lời mời chờ phản hồi trong cuộc trò chuyện này"
            );
        }
        if (request == null || request.getShowtimeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn suất chiếu");
        }

        Showtime showtime = showtimeRepository.findWithDetailsById(request.getShowtimeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy suất chiếu"));
        requireAvailableShowtime(showtime);

        MovieDate invitation = new MovieDate();
        invitation.setMatch(match);
        invitation.setProposer(proposer);
        invitation.setMovie(showtime.getMovie());
        invitation.setShowtime(showtime);
        invitation.setProposedAt(LocalDateTime.now());
        invitation.setExpiresAt(showtime.getStartTime());
        invitation.setStatus(MovieDateStatus.PROPOSED);
        invitation = invitationRepository.save(invitation);

        MovieInvitationResponse response = toResponse(invitation, proposer);
        realtimePublisher.publishMatch(matchId, "INVITATION_CREATED", response);
        return response;
    }

    @Transactional
    public MovieInvitationResponse acceptInvitation(String email, Long matchId, Long invitationId) {
        Customer recipient = findCustomer(email);
        Match match = findAccessibleMatch(matchId, recipient);
        requireActiveMatch(match);
        MovieDate invitation = findInvitation(invitationId, matchId);
        requireRecipient(invitation, match, recipient);
        requireProposed(invitation);
        requireAvailableShowtime(invitation.getShowtime());

        invitation.setStatus(MovieDateStatus.ACCEPTED);
        invitationRepository.save(invitation);
        GroupBookingSession group = groupBookingService.createFromInvitation(invitation, match);
        invitation.setGroupBookingSession(group);
        MovieInvitationResponse response = toResponse(invitationRepository.save(invitation), recipient);
        realtimePublisher.publishMatch(matchId, "INVITATION_ACCEPTED", response);
        return response;
    }

    @Transactional
    public MovieInvitationResponse rejectInvitation(String email, Long matchId, Long invitationId) {
        Customer recipient = findCustomer(email);
        Match match = findAccessibleMatch(matchId, recipient);
        MovieDate invitation = findInvitation(invitationId, matchId);
        requireRecipient(invitation, match, recipient);
        requireProposed(invitation);
        invitation.setStatus(MovieDateStatus.REJECTED);
        MovieInvitationResponse response = toResponse(invitationRepository.save(invitation), recipient);
        realtimePublisher.publishMatch(matchId, "INVITATION_REJECTED", response);
        return response;
    }

    @Transactional
    public MovieInvitationResponse cancelInvitation(String email, Long matchId, Long invitationId) {
        Customer proposer = findCustomer(email);
        findAccessibleMatch(matchId, proposer);
        MovieDate invitation = findInvitation(invitationId, matchId);
        if (!invitation.getProposer().getId().equals(proposer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người gửi mới có thể hủy lời mời");
        }
        requireProposed(invitation);
        invitation.setStatus(MovieDateStatus.CANCELLED);
        MovieInvitationResponse response = toResponse(invitationRepository.save(invitation), proposer);
        realtimePublisher.publishMatch(matchId, "INVITATION_CANCELLED", response);
        return response;
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
    }

    private Match findAccessibleMatch(Long matchId, Customer customer) {
        return matchRepository.findById(matchId)
                .filter(match -> match.getCustomerA().getId().equals(customer.getId())
                        || match.getCustomerB().getId().equals(customer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc match này"));
    }

    private MovieDate findInvitation(Long invitationId, Long matchId) {
        return invitationRepository.findByIdAndMatch_Id(invitationId, matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời"));
    }

    private void requireActiveMatch(Match match) {
        if (match.getStatus() != MatchStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Match không còn hoạt động");
        }
    }

    private void requireCineMeetEnabled(Customer customer) {
        if (customer.getProfileCard() == null || !customer.getProfileCard().isCineMeetEnabled()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cả hai thành viên phải bật CineMeet");
        }
    }

    private void requireAvailableShowtime(Showtime showtime) {
        if (showtime.getStatus() != ShowtimeStatus.AVAILABLE
                || showtime.getStartTime() == null
                || !showtime.getStartTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Suất chiếu không còn khả dụng");
        }
    }

    private void requireProposed(MovieDate invitation) {
        if (invitation.getStatus() != MovieDateStatus.PROPOSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lời mời đã được xử lý");
        }
        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lời mời đã hết hạn");
        }
    }

    private void requireRecipient(MovieDate invitation, Match match, Customer customer) {
        Customer recipient = match.getCustomerA().getId().equals(invitation.getProposer().getId())
                ? match.getCustomerB() : match.getCustomerA();
        if (!recipient.getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Người gửi không thể tự phản hồi lời mời");
        }
    }

    private MovieInvitationResponse toResponse(MovieDate invitation, Customer viewer) {
        Match match = invitation.getMatch();
        Customer recipient = match.getCustomerA().getId().equals(invitation.getProposer().getId())
                ? match.getCustomerB() : match.getCustomerA();
        Showtime showtime = invitation.getShowtime();
        return MovieInvitationResponse.builder()
                .id(invitation.getId())
                .matchId(match.getId())
                .proposerId(invitation.getProposer().getId())
                .proposerName(displayName(invitation.getProposer()))
                .recipientId(recipient.getId())
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie() != null ? showtime.getMovie().getId() : null)
                .movieTitle(showtime.getMovie() != null ? showtime.getMovie().getTitle() : null)
                .moviePosterUrl(showtime.getMovie() != null ? showtime.getMovie().getImages() : null)
                .cinemaName(showtime.getCinema() != null ? showtime.getCinema().getName() : null)
                .roomName(showtime.getRoom() != null ? showtime.getRoom().getName() : null)
                .startTime(showtime.getStartTime())
                .proposedAt(invitation.getProposedAt())
                .expiresAt(invitation.getExpiresAt())
                .status(invitation.getStatus())
                .groupId(invitation.getGroupBookingSession() != null
                        ? invitation.getGroupBookingSession().getId() : null)
                .build();
    }

    private String displayName(Customer customer) {
        return customer.getProfileCard() != null
                && customer.getProfileCard().getDisplayName() != null
                ? customer.getProfileCard().getDisplayName() : customer.getFullName();
    }
}
