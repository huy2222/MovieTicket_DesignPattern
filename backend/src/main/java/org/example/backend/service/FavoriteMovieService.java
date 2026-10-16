package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.MovieResponse;
import org.example.backend.entity.FavoriteMovie;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Movie;
import org.example.backend.entity.User;
import org.example.backend.repository.FavoriteMovieRepository;
import org.example.backend.repository.MovieRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteMovieService {

    private final FavoriteMovieRepository favoriteMovieRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MovieResponse> getFavorites(String email) {
        List<FavoriteMovie> favorites = favoriteMovieRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        return favorites.stream()
                .map(fav -> toMovieResponse(fav.getMovie()))
                .toList();
    }

    @Transactional
    public void addFavorite(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện chức năng này"));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ phim yêu cầu"));

        if (favoriteMovieRepository.existsByUser_EmailAndMovie_Id(email, movieId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phim đã có trong danh sách yêu thích.");
        }

        FavoriteMovie favoriteMovie = FavoriteMovie.builder()
                .user(user)
                .movie(movie)
                .createdAt(LocalDateTime.now())
                .build();

        favoriteMovieRepository.save(favoriteMovie);
    }

    @Transactional
    public void removeFavorite(String email, Long movieId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập"));

        favoriteMovieRepository.deleteByUser_EmailAndMovie_Id(email, movieId);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(String email, Long movieId) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return favoriteMovieRepository.existsByUser_EmailAndMovie_Id(email, movieId);
    }

    private MovieResponse toMovieResponse(Movie movie) {
        List<Genre> genres = movie.getGenres() != null ? movie.getGenres() : List.of();
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
                .genreIds(genres.stream().map(Genre::getId).toList())
                .genres(genres.stream().map(Genre::getName).toList())
                .directorNames(splitNames(movie.getDirector()))
                .actorNames(splitNames(movie.getCast()))
                .ageRestriction(movie.getAgeRating())
                .status(movie.getStatus())
                .averageRating(movie.getAverageRating() != null ? movie.getAverageRating() : 0.0)
                .build();
    }

    private List<String> splitNames(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
