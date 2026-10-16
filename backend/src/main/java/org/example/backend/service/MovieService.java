package org.example.backend.service;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.dto.request.MovieRequest;
import org.example.backend.dto.request.MovieStatusRequest;
import org.example.backend.dto.response.MovieDeleteResponse;
import org.example.backend.dto.response.MovieHomeResponse;
import org.example.backend.dto.response.MoviePageResponse;
import org.example.backend.dto.response.MovieResponse;
import org.example.backend.dto.response.MovieSummaryResponse;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Movie;
import org.example.backend.enums.AgeRating;
import org.example.backend.enums.MovieStatus;
import org.example.backend.repository.GenreRepository;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.MovieDateRepository;
import org.example.backend.repository.MovieHistoryRepository;
import org.example.backend.repository.MovieRepository;
import org.example.backend.repository.ReviewRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.example.backend.repository.VoucherRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private static final Pattern YOUTUBE_URL_PATTERN = Pattern.compile(
            "^(https?://)?(www\\.)?(youtube\\.com/(watch\\?v=|embed/|shorts/)|youtu\\.be/)[\\w-]{11}.*$",
            Pattern.CASE_INSENSITIVE
    );

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieDateRepository movieDateRepository;
    private final MessageRepository messageRepository;
    private final ReviewRepository reviewRepository;
    private final MovieHistoryRepository movieHistoryRepository;
    private final VoucherRepository voucherRepository;
    private final SearchStrategyContext searchStrategyContext;

    public MovieService(
            MovieRepository movieRepository,
            GenreRepository genreRepository,
            ShowtimeRepository showtimeRepository,
            MovieDateRepository movieDateRepository,
            MessageRepository messageRepository,
            ReviewRepository reviewRepository,
            MovieHistoryRepository movieHistoryRepository,
            VoucherRepository voucherRepository,
            SearchStrategyContext searchStrategyContext
    ) {
        this.movieRepository = movieRepository;
        this.genreRepository = genreRepository;
        this.showtimeRepository = showtimeRepository;
        this.movieDateRepository = movieDateRepository;
        this.messageRepository = messageRepository;
        this.reviewRepository = reviewRepository;
        this.movieHistoryRepository = movieHistoryRepository;
        this.voucherRepository = voucherRepository;
        this.searchStrategyContext = searchStrategyContext;
    }

    @Transactional(readOnly = true)
    public MoviePageResponse getMovies(String search, MovieStatus status, int page, int size, String sortDirection) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "releaseDate"));

        List<MovieStatus> statuses = resolveStatusFilter(status);
        if (statuses == null) {
            statuses = List.of(MovieStatus.values());
        }
        Page<Movie> moviePage = movieRepository.searchMovies(
                search != null ? search.trim() : null,
                statuses,
                pageable
        );

        return MoviePageResponse.builder()
                .content(moviePage.getContent().stream().map(this::toResponse).toList())
                .page(moviePage.getNumber())
                .size(moviePage.getSize())
                .totalElements(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public MoviePageResponse searchMovies(MovieSearchRequest request) {
        String sortByField = request.getSortBy();
        if ("title".equalsIgnoreCase(sortByField) || "name".equalsIgnoreCase(sortByField)) {
            sortByField = "title";
        } else if ("releaseDate".equalsIgnoreCase(sortByField)) {
            sortByField = "releaseDate";
        } else if ("rating".equalsIgnoreCase(sortByField)) {
            sortByField = "averageRating";
        } else if ("duration".equalsIgnoreCase(sortByField)) {
            sortByField = "duration";
        } else {
            sortByField = "releaseDate";
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortDirection())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), Sort.by(direction, sortByField));

        Specification<Movie> spec = searchStrategyContext.buildSpecification(request);

        Page<Movie> moviePage = movieRepository.findAll(spec, pageable);

        return MoviePageResponse.builder()
                .content(moviePage.getContent().stream().map(this::toResponse).toList())
                .page(moviePage.getNumber())
                .size(moviePage.getSize())
                .totalElements(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        return toResponse(findMovieWithGenres(id));
    }

    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByStatus(MovieStatus status) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái phim không được để trống");
        }
        return movieRepository.findByStatusOrderByReleaseDateDesc(status).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MovieHomeResponse getHomeMovies() {
        List<Movie> movies = movieRepository.findByStatusInOrderByReleaseDateDesc(
                List.of(MovieStatus.NOW_SHOWING, MovieStatus.COMING_SOON)
        );

        List<MovieSummaryResponse> nowShowing = new ArrayList<>();
        List<MovieSummaryResponse> comingSoon = new ArrayList<>();

        for (Movie movie : movies) {
            MovieSummaryResponse summary = toSummaryResponse(movie);
            if (movie.getStatus() == MovieStatus.NOW_SHOWING) {
                nowShowing.add(summary);
            } else if (movie.getStatus() == MovieStatus.COMING_SOON) {
                comingSoon.add(summary);
            }
        }

        return MovieHomeResponse.builder()
                .nowShowing(nowShowing)
                .comingSoon(comingSoon)
                .build();
    }

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        validateMovieRequest(request, true);

        Movie movie = new Movie();
        applyRequestToMovie(request, movie);

        String currentEmail = "System";
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
            currentEmail = auth.getName();
        }
        movie.setCreatedBy(currentEmail);
        movie.setCreatedAt(java.time.LocalDateTime.now());

        Movie saved = movieRepository.save(movie);
        return toResponse(findMovieWithGenres(saved.getId()));
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        validateMovieRequest(request, false);

        Movie movie = findMovieWithGenres(id);
        applyRequestToMovie(request, movie);

        Movie saved = movieRepository.save(movie);
        return toResponse(findMovieWithGenres(saved.getId()));
    }

    @Transactional
    public MovieResponse updateMovieStatus(Long id, MovieStatusRequest request) {
        if (request.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái phim không được để trống");
        }

        Movie movie = findMovieWithGenres(id);
        movie.setStatus(request.getStatus());
        Movie saved = movieRepository.save(movie);
        return toResponse(findMovieWithGenres(saved.getId()));
    }

    @Transactional
    public MovieDeleteResponse deleteMovie(Long id) {
        Movie movie = findMovie(id);

        if (hasRelatedData(id)) {
            movie.setStatus(MovieStatus.ENDED);
            movieRepository.save(movie);
            return MovieDeleteResponse.builder()
                    .action("ENDED")
                    .message("Phim đã được chuyển sang trạng thái Ended vì có dữ liệu liên quan")
                    .build();
        }

        movieRepository.delete(movie);
        return MovieDeleteResponse.builder()
                .action("DELETED")
                .message("Đã xóa phim thành công")
                .build();
    }

    public boolean hasRelatedData(Long movieId) {
        return showtimeRepository.existsByMovie_Id(movieId)
                || movieDateRepository.existsByMovie_Id(movieId)
                || messageRepository.existsBySharedMovie_Id(movieId)
                || reviewRepository.existsByMovie_Id(movieId)
                || movieHistoryRepository.existsByMovie_Id(movieId)
                || voucherRepository.existsByApplicableMovieId(movieId);
    }

    private Movie findMovie(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
    }

    private Movie findMovieWithGenres(Long id) {
        return movieRepository.findWithGenresById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
    }

    private void validateMovieRequest(MovieRequest request, boolean isCreate) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên phim không được để trống");
        }
        if (request.getPosterUrl() == null || request.getPosterUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poster URL không được để trống");
        }
        if (request.getGenreIds() == null || request.getGenreIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một thể loại");
        }
        if (request.getDuration() == null || request.getDuration() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời lượng phải lớn hơn 0");
        }
        if (request.getReleaseDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày khởi chiếu không được để trống");
        }
        if (isCreate && request.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái phim không được để trống");
        }
        if (request.getAgeRestriction() != null && !request.getAgeRestriction().isBlank()) {
            String ageValue = request.getAgeRestriction().trim().toUpperCase();
            try {
                AgeRating.valueOf(ageValue);
                request.setAgeRestriction(ageValue);
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Phân loại độ tuổi không hợp lệ. Chọn một trong: P, K, T13, T16, T18, C"
                );
            }
        }
        if (request.getTrailerUrl() != null && !request.getTrailerUrl().isBlank()
                && !isValidYoutubeUrl(request.getTrailerUrl())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trailer URL không hợp lệ. Vui lòng dùng link Youtube hợp lệ"
            );
        }
    }

    private boolean isValidYoutubeUrl(String url) {
        return YOUTUBE_URL_PATTERN.matcher(url.trim()).matches();
    }

    private void applyRequestToMovie(MovieRequest request, Movie movie) {
        movie.setTitle(request.getTitle().trim());
        movie.setEnglishTitle(trimToNull(request.getEnglishTitle()));
        movie.setDescription(trimToNull(request.getDescription()));
        movie.setDuration(request.getDuration());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setAgeRating(trimToNull(request.getAgeRestriction()));
        movie.setImages(request.getPosterUrl().trim());
        movie.setBanner(trimToNull(request.getBannerUrl()));
        movie.setTrailers(trimToNull(request.getTrailerUrl()));
        movie.setCountry(trimToNull(request.getCountry()));
        movie.setLanguage(trimToNull(request.getLanguage()));
        movie.setDirector(joinNames(request.getDirectorNames()));
        movie.setCast(joinNames(request.getActorNames()));

        if (request.getStatus() != null) {
            movie.setStatus(request.getStatus());
        }

        List<Genre> genres = genreRepository.findAllById(request.getGenreIds());
        if (genres.size() != request.getGenreIds().size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Một hoặc nhiều thể loại không tồn tại trong hệ thống"
            );
        }
        movie.setGenres(new ArrayList<>(genres));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String joinNames(List<String> names) {
        if (names == null || names.isEmpty()) {
            return null;
        }
        String joined = names.stream()
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .collect(Collectors.joining(", "));
        return joined.isBlank() ? null : joined;
    }

    private List<String> splitNames(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .toList();
    }

    private List<MovieStatus> resolveStatusFilter(MovieStatus status) {
        if (status == null) {
            return null;
        }
        return List.of(status);
    }

    private MovieSummaryResponse toSummaryResponse(Movie movie) {
        return MovieSummaryResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .posterUrl(movie.getImages())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .ageRestriction(movie.getAgeRating())
                .status(movie.getStatus())
                .build();
    }

    private MovieResponse toResponse(Movie movie) {
        boolean related = hasRelatedData(movie.getId());
        List<Genre> genreList = movie.getGenres() != null ? movie.getGenres() : List.of();

        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .englishTitle(movie.getEnglishTitle())
                .description(movie.getDescription())
                .posterUrl(movie.getImages())
                .bannerUrl(movie.getBanner())
                .trailerUrl(movie.getTrailers())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .country(movie.getCountry())
                .language(movie.getLanguage())
                .genreIds(genreList.stream().map(Genre::getId).toList())
                .genres(genreList.stream().map(Genre::getName).toList())
                .directorNames(splitNames(movie.getDirector()))
                .actorNames(splitNames(movie.getCast()))
                .ageRestriction(movie.getAgeRating())
                .status(movie.getStatus())
                .createdBy(movie.getCreatedBy())
                .createdAt(movie.getCreatedAt())
                .averageRating(movie.getAverageRating())
                .hasRelatedData(related)
                .deletable(!related)
                .build();
    }
}
