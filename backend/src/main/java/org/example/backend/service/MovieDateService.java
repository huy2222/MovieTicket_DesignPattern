package org.example.backend.service;

import org.example.backend.dto.request.MovieDateRequest;
import org.example.backend.dto.response.MovieDateResponse;
import org.example.backend.entity.*;
import org.example.backend.enums.MovieDateStatus;
import org.example.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovieDateService {

    private final MovieDateRepository movieDateRepository;
    private final MatchRepository matchRepository;
    private final CustomerRepository customerRepository;
    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final GroupBookingService groupBookingService;
    private final CineMeetRealtimePublisher realtimePublisher;

    public MovieDateService(
            MovieDateRepository movieDateRepository,
            MatchRepository matchRepository,
            CustomerRepository customerRepository,
            MovieRepository movieRepository,
            ShowtimeRepository showtimeRepository,
            GroupBookingService groupBookingService,
            CineMeetRealtimePublisher realtimePublisher
    ) {
        this.movieDateRepository = movieDateRepository;
        this.matchRepository = matchRepository;
        this.customerRepository = customerRepository;
        this.movieRepository = movieRepository;
        this.showtimeRepository = showtimeRepository;
        this.groupBookingService = groupBookingService;
        this.realtimePublisher = realtimePublisher;
    }

    @Transactional
    public MovieDateResponse proposeMovieDate(String email, Long matchId, MovieDateRequest request) {
        Customer customer = findCustomer(email);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Match"));

        if (!match.getCustomerA().getId().equals(customer.getId()) &&
            !match.getCustomerB().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc Match này");
        }

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Phim"));
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Suất chiếu"));

        MovieDate movieDate = new MovieDate();
        movieDate.setProposer(customer);
        movieDate.setMatch(match);
        movieDate.setMovie(movie);
        movieDate.setShowtime(showtime);
        movieDate.setStatus(MovieDateStatus.PROPOSED);
        movieDate.setProposedAt(LocalDateTime.now());
        movieDate.setExpiresAt(showtime.getStartTime());

        movieDate = movieDateRepository.save(movieDate);

        MovieDateResponse response = toResponse(movieDate);
        realtimePublisher.publishMatch(matchId, "MOVIE_DATE_PROPOSED", response);

        return response;
    }

    @Transactional
    public MovieDateResponse respondToMovieDate(String email, Long dateId, boolean accept) {
        Customer customer = findCustomer(email);
        MovieDate movieDate = movieDateRepository.findById(dateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời"));

        if (movieDate.getStatus() != MovieDateStatus.PROPOSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lời mời này đã được xử lý hoặc hết hạn");
        }

        if (movieDate.getProposer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thể phản hồi lời mời do chính mình tạo");
        }

        if (!movieDate.getMatch().getCustomerA().getId().equals(customer.getId()) &&
            !movieDate.getMatch().getCustomerB().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc Match này");
        }

        if (accept) {
            movieDate.setStatus(MovieDateStatus.ACCEPTED);
            movieDateRepository.save(movieDate);
            GroupBookingSession group = groupBookingService.createFromInvitation(movieDate, movieDate.getMatch());
            movieDate.setGroupBookingSession(group);
        } else {
            movieDate.setStatus(MovieDateStatus.REJECTED);
        }

        movieDate = movieDateRepository.save(movieDate);
        MovieDateResponse response = toResponse(movieDate);
        realtimePublisher.publishMatch(movieDate.getMatch().getId(), "MOVIE_DATE_RESPONDED", response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<MovieDateResponse> getMovieDatesForMatch(String email, Long matchId) {
        Customer customer = findCustomer(email);
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Match"));

        if (!match.getCustomerA().getId().equals(customer.getId()) &&
            !match.getCustomerB().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc Match này");
        }

        return movieDateRepository.findByMatch_IdOrderByProposedAtDesc(matchId).stream()
                .map(this::toResponse)
                .toList();
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    private MovieDateResponse toResponse(MovieDate date) {
        return MovieDateResponse.builder()
                .id(date.getId())
                .matchId(date.getMatch().getId())
                .proposerId(date.getProposer().getId())
                .movieId(date.getMovie().getId())
                .movieTitle(date.getMovie().getTitle())
                .moviePosterUrl(date.getMovie().getImages())
                .showtimeId(date.getShowtime().getId())
                .cinemaName(date.getShowtime().getCinema().getName())
                .roomName(date.getShowtime().getRoom().getName())
                .startTime(date.getShowtime().getStartTime())
                .status(date.getStatus())
                .proposedAt(date.getProposedAt())
                .expiresAt(date.getExpiresAt())
                .groupBookingSessionId(date.getGroupBookingSession() != null ? date.getGroupBookingSession().getId() : null)
                .build();
    }
}
