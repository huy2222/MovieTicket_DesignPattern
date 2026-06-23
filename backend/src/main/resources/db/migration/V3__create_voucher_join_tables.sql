-- Bảng trung gian ManyToMany giữa vouchers và movies
CREATE TABLE IF NOT EXISTS voucher_movies (
    voucher_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    PRIMARY KEY (voucher_id, movie_id),
    CONSTRAINT fk_voucher_movies_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_movies_movie
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng trung gian ManyToMany giữa vouchers và cinemas
CREATE TABLE IF NOT EXISTS voucher_cinemas (
    voucher_id BIGINT NOT NULL,
    cinema_id BIGINT NOT NULL,
    PRIMARY KEY (voucher_id, cinema_id),
    CONSTRAINT fk_voucher_cinemas_voucher
        FOREIGN KEY (voucher_id) REFERENCES vouchers (id) ON DELETE CASCADE,
    CONSTRAINT fk_voucher_cinemas_cinema
        FOREIGN KEY (cinema_id) REFERENCES cinemas (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
