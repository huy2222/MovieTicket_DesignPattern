-- Đồng bộ giá trị status cũ sang enum mới trước khi sửa cột
UPDATE movies SET status = 'ENDED'
WHERE status IN ('STOPPED', 'stopped', 'Ended');

UPDATE movies SET status = 'COMING_SOON'
WHERE status IN ('UPCOMING', 'FEATURED', 'upcoming', 'featured', 'Coming Soon');

UPDATE movies SET status = 'NOW_SHOWING'
WHERE status IN ('NOW SHOWING', 'now_showing', 'Now Showing');

-- Chuẩn hóa cột status (MySQL ENUM)
ALTER TABLE movies
    MODIFY COLUMN status ENUM('COMING_SOON', 'NOW_SHOWING', 'ENDED') NOT NULL DEFAULT 'COMING_SOON';
