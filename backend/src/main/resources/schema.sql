CREATE TABLE IF NOT EXISTS customer_favorite_genres (
    customer_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (customer_id, genre_id),
    CONSTRAINT fk_customer_favorite_genres_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_favorite_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_frequent_cinemas (
    customer_id BIGINT NOT NULL,
    cinema_id BIGINT NOT NULL,
    PRIMARY KEY (customer_id, cinema_id),
    CONSTRAINT fk_customer_frequent_cinemas_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_frequent_cinemas_cinema
        FOREIGN KEY (cinema_id) REFERENCES cinemas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movie_history_genres (
    movie_history_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (movie_history_id, genre_id),
    CONSTRAINT fk_movie_history_genres_history
        FOREIGN KEY (movie_history_id) REFERENCES movie_histories (id) ON DELETE CASCADE,
    CONSTRAINT fk_movie_history_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS showtime_vouchers (
    showtime_id BIGINT NOT NULL,
    voucher_id BIGINT NOT NULL,
    PRIMARY KEY (showtime_id, voucher_id),
    CONSTRAINT fk_showtime_vouchers_showtime
        FOREIGN KEY (showtime_id) REFERENCES showtimes (id) ON DELETE CASCADE,
    CONSTRAINT fk_showtime_vouchers_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile_card_genres (
    profile_card_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (profile_card_id, genre_id),
    CONSTRAINT fk_profile_card_genres_profile_card
        FOREIGN KEY (profile_card_id) REFERENCES profile_cards (id) ON DELETE CASCADE,
    CONSTRAINT fk_profile_card_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS group_booking_participants (
    session_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    PRIMARY KEY (session_id, customer_id),
    CONSTRAINT fk_group_booking_participants_session
        FOREIGN KEY (session_id) REFERENCES group_booking_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_group_booking_participants_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_movie_genres_movie
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
    CONSTRAINT fk_movie_genres_genre
        FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS voucher_movies (
    voucher_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    PRIMARY KEY (voucher_id, movie_id),
    CONSTRAINT fk_voucher_movies_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_movies_movie
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS voucher_cinemas (
    voucher_id BIGINT NOT NULL,
    cinema_id BIGINT NOT NULL,
    PRIMARY KEY (voucher_id, cinema_id),
    CONSTRAINT fk_voucher_cinemas_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_cinemas_cinema
        FOREIGN KEY (cinema_id) REFERENCES cinemas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance Indexes for CineMeet Realtime Seating
CREATE INDEX IF NOT EXISTS idx_ticket_showtime ON tickets(showtime_id, status);
CREATE INDEX IF NOT EXISTS idx_seathold_showtime_expires ON seat_holds(showtime_id, expires_at);
