package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.MovieResponse;
import org.example.backend.service.FavoriteMovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin
public class FavoriteMovieController {

    private final FavoriteMovieService favoriteMovieService;

    @GetMapping
    public ResponseEntity<?> getFavorites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem danh sách phim yêu thích"));
        }

        List<MovieResponse> list = favoriteMovieService.getFavorites(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addFavorite(@PathVariable Long movieId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để thêm phim yêu thích"));
        }

        try {
            favoriteMovieService.addFavorite(authentication.getName(), movieId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("success", true, "message", "Thêm phim vào danh sách yêu thích thành công."));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Thêm phim vào danh sách yêu thích thất bại. Vui lòng thử lại sau."));
        }
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long movieId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xóa phim yêu thích"));
        }

        try {
            favoriteMovieService.removeFavorite(authentication.getName(), movieId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa phim khỏi danh sách yêu thích thành công."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Xóa phim khỏi danh sách yêu thích thất bại. Vui lòng thử lại sau."));
        }
    }

    @GetMapping("/check/{movieId}")
    public ResponseEntity<?> checkFavorite(@PathVariable Long movieId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("isFavorite", false));
        }

        boolean isFav = favoriteMovieService.isFavorite(authentication.getName(), movieId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }
}
