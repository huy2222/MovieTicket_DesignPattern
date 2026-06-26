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
        try {
            ensureMovieGenresTable();
            ensureVoucherMoviesTable();
            ensureVoucherCinemasTable();
            ensureProfileCardGenresTable();
            ensureGroupBookingParticipantsTable();
            syncMovieStatusColumn();
            syncNotificationTypeColumn();
        } catch (RuntimeException ex) {
            System.out.println("[Schema] Migration skipped because database is temporarily unavailable: "
                    + ex.getMessage());
        }
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

    private void ensureProfileCardGenresTable() {
        if (tableExists("profile_card_genres")) {
            return;
        }

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS profile_card_genres (
                    profile_card_id BIGINT NOT NULL,
                    genre_id BIGINT NOT NULL,
                    PRIMARY KEY (profile_card_id, genre_id),
                    CONSTRAINT fk_profile_card_genres_profile
                        FOREIGN KEY (profile_card_id) REFERENCES profile_cards (id) ON DELETE CASCADE,
                    CONSTRAINT fk_profile_card_genres_genre
                        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        System.out.println("[Schema] Created table profile_card_genres");
    }

    private void ensureGroupBookingParticipantsTable() {
        if (tableExists("group_booking_participants")) {
            return;
        }

        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS group_booking_participants (
                    session_id BIGINT NOT NULL,
                    customer_id BIGINT NOT NULL,
                    PRIMARY KEY (session_id, customer_id),
                    CONSTRAINT fk_group_booking_participants_session
                        FOREIGN KEY (session_id) REFERENCES group_booking_sessions (id) ON DELETE CASCADE,
                    CONSTRAINT fk_group_booking_participants_customer
                        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """);
        System.out.println("[Schema] Created table group_booking_participants");
    }

    private void syncMovieStatusColumn() {
        try {
            jdbcTemplate.execute(
                    "UPDATE movies SET status = 'ENDED' WHERE status IN ('STOPPED', 'stopped', 'Ended')"
            );
            jdbcTemplate.execute(
                    "UPDATE movies SET status = 'COMING_SOON' WHERE status IN ('UPCOMING', 'FEATURED', 'upcoming', 'featured')"
            );
            if (!isMovieStatusColumnSynced()) {
                jdbcTemplate.execute(
                        "ALTER TABLE movies MODIFY COLUMN status " +
                                "ENUM('COMING_SOON', 'NOW_SHOWING', 'ENDED') NOT NULL DEFAULT 'COMING_SOON'"
                );
                System.out.println("[Schema] Synced movies.status column");
            }
        } catch (Exception ex) {
            // Cột có thể đã đúng định dạng — bỏ qua
            System.out.println("[Schema] movies.status already synced or skipped: " + ex.getMessage());
        }
    }

    private boolean isMovieStatusColumnSynced() {
        String expected = "enum('COMING_SOON','NOW_SHOWING','ENDED')";
        String columnType = jdbcTemplate.queryForObject(
                """
                SELECT column_type
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = 'movies'
                  AND column_name = 'status'
                """,
                String.class
        );
        return expected.equalsIgnoreCase(columnType);
    }

    private void syncNotificationTypeColumn() {
        try {
            if (tableExists("notifications") && !isNotificationTypeColumnSynced()) {
                jdbcTemplate.execute("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) DEFAULT NULL");
                System.out.println("[Schema] Synced notifications.type column to VARCHAR(50)");
            }
        } catch (Exception ex) {
            System.out.println("[Schema] notifications.type sync skipped: " + ex.getMessage());
        }
    }

    private boolean isNotificationTypeColumnSynced() {
        String dataType = jdbcTemplate.queryForObject(
                """
                SELECT data_type
                FROM information_schema.columns
                WHERE table_schema = DATABASE()
                  AND table_name = 'notifications'
                  AND column_name = 'type'
                """,
                String.class
        );
        return "varchar".equalsIgnoreCase(dataType);
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
