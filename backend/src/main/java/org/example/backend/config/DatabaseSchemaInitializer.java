package org.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Tự động chạy migration SQL khi khởi động nếu bảng/schema chưa tồn tại.
 */
@Component
@Order(1)
public class DatabaseSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureMovieGenresTable();
        ensureVoucherMoviesTable();
        ensureVoucherCinemasTable();
        syncMovieStatusColumn();
    }

    private void ensureMovieGenresTable() {
        if (tableExists("movie_genres")) {
            return;
        }

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS movie_genres (
                    movie_id BIGINT NOT NULL,
                    genre_id BIGINT NOT NULL,
                    PRIMARY KEY (movie_id, genre_id),
                    CONSTRAINT fk_movie_genres_movie
                        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
                    CONSTRAINT fk_movie_genres_genre
                        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        System.out.println("[Schema] Created table movie_genres");
    }

    private void ensureVoucherMoviesTable() {
        if (tableExists("voucher_movies")) {
            return;
        }

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS voucher_movies (
                    voucher_id BIGINT NOT NULL,
                    movie_id BIGINT NOT NULL,
                    PRIMARY KEY (voucher_id, movie_id),
                    CONSTRAINT fk_voucher_movies_voucher
                        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
                    CONSTRAINT fk_voucher_movies_movie
                        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        System.out.println("[Schema] Created table voucher_movies");
    }

    private void ensureVoucherCinemasTable() {
        if (tableExists("voucher_cinemas")) {
            return;
        }

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS voucher_cinemas (
                    voucher_id BIGINT NOT NULL,
                    cinema_id BIGINT NOT NULL,
                    PRIMARY KEY (voucher_id, cinema_id),
                    CONSTRAINT fk_voucher_cinemas_voucher
                        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
                    CONSTRAINT fk_voucher_cinemas_cinema
                        FOREIGN KEY (cinema_id) REFERENCES cinemas (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        System.out.println("[Schema] Created table voucher_cinemas");
    }

    private void syncMovieStatusColumn() {
        try {
            jdbcTemplate.execute(
                    "UPDATE movies SET status = 'ENDED' WHERE status IN ('STOPPED', 'stopped', 'Ended')"
            );
            jdbcTemplate.execute(
                    "UPDATE movies SET status = 'COMING_SOON' WHERE status IN ('UPCOMING', 'FEATURED', 'upcoming', 'featured')"
            );
            jdbcTemplate.execute(
                    "ALTER TABLE movies MODIFY COLUMN status " +
                            "ENUM('COMING_SOON', 'NOW_SHOWING', 'ENDED') NOT NULL DEFAULT 'COMING_SOON'"
            );
            System.out.println("[Schema] Synced movies.status column");
        } catch (Exception ex) {
            // Cột có thể đã đúng định dạng — bỏ qua
            System.out.println("[Schema] movies.status already synced or skipped: " + ex.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                  AND table_name = ?
                """,
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }
}
