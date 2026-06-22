# Database migrations

Chạy các script SQL theo thứ tự trong thư mục `migration/` trên database `ticketmovie_db`:

1. `V1__create_movie_genres.sql` — tạo bảng trung gian `movie_genres`
2. `V2__sync_movie_status_column.sql` — đồng bộ cột `status` (COMING_SOON, NOW_SHOWING, ENDED)
3. `V3__create_voucher_join_tables.sql` — tạo bảng `voucher_movies` và `voucher_cinemas`

**Lưu ý:** Backend tự tạo các bảng trên khi khởi động qua `DatabaseSchemaInitializer`. Chỉ cần **restart backend** nếu chưa có các bảng này.

Ví dụ với MySQL CLI:

```bash
mysql -u root -p ticketmovie_db < src/main/resources/db/migration/V1__create_movie_genres.sql
mysql -u root -p ticketmovie_db < src/main/resources/db/migration/V2__sync_movie_status_column.sql
```

Hoặc copy nội dung script và chạy trong MySQL Workbench / phpMyAdmin.
