package org.example.backend.exception;

import org.example.backend.dto.response.ApiErrorResponse;
import org.hibernate.exception.GenericJDBCException;
import org.hibernate.exception.SQLGrammarException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Đã xảy ra lỗi";
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiErrorResponse.builder().message(message).build());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        Throwable cause = ex.getCause();
        if (cause != null) {
            String causeMessage = cause.getMessage() != null ? cause.getMessage() : "";
            if (causeMessage.contains("MovieStatus")) {
                return badRequest(
                        "Trạng thái phim không hợp lệ. Chọn một trong: COMING_SOON, NOW_SHOWING, ENDED"
                );
            }
            if (cause instanceof IllegalArgumentException illegalArgument) {
                return badRequest(illegalArgument.getMessage());
            }
        }
        return badRequest("Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại các trường.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Dữ liệu không hợp lệ");
        return badRequest(message);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.builder().message(resolveDataAccessMessage(ex)).build());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDataAccessException(DataAccessException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.builder().message(resolveDataAccessMessage(ex)).build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace();
        String message = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.builder()
                        .message("Lỗi hệ thống: " + message)
                        .build());
    }

    private ResponseEntity<ApiErrorResponse> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorResponse.builder().message(message).build());
    }

    private String resolveDataAccessMessage(Throwable ex) {
        String raw = extractDeepMessage(ex);

        if (raw.contains("movie_genres") && raw.contains("doesn't exist")) {
            return "Bảng movie_genres chưa tồn tại. Vui lòng chạy migration V1__create_movie_genres.sql hoặc restart backend";
        }
        if (raw.contains("voucher_movies") && raw.contains("doesn't exist")) {
            return "Bảng voucher_movies chưa tồn tại. Vui lòng restart backend để tự tạo bảng hoặc chạy migration V3__create_voucher_join_tables.sql";
        }
        if (raw.contains("voucher_cinemas") && raw.contains("doesn't exist")) {
            return "Bảng voucher_cinemas chưa tồn tại. Vui lòng restart backend để tự tạo bảng hoặc chạy migration V3__create_voucher_join_tables.sql";
        }
        if (raw.contains("Data truncated for column 'status'")) {
            return "Lỗi cấu trúc DB: Dữ liệu trạng thái quá dài (Data truncated for column 'status'). Vui lòng khởi động lại Backend để tự sửa lỗi.";
        }
        if (raw.contains("Data truncated for column 'type'") && raw.contains("notifications")) {
            return "Cấu hình thông báo CineMeet chưa được cập nhật. Vui lòng restart backend để đồng bộ schema.";
        }
        if (raw.contains("foreign key constraint fails") && raw.contains("movie_genres")) {
            return "Thể loại hoặc phim không tồn tại. Vui lòng chọn lại thể loại hợp lệ";
        }
        if (raw.contains("Duplicate entry") && raw.contains("movie_genres")) {
            return "Thể loại đã được gán cho phim này";
        }

        return raw;
    }

    private String extractDeepMessage(Throwable ex) {
        Throwable current = ex;
        String message = ex.getMessage() != null ? ex.getMessage() : "";

        while (current.getCause() != null) {
            current = current.getCause();
            if (current.getMessage() != null) {
                message = current.getMessage();
            }
            if (current instanceof GenericJDBCException || current instanceof SQLGrammarException) {
                break;
            }
        }

        return message;
    }
}
