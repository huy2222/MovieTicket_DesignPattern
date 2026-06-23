#!/usr/bin/env python3
"""Generate insert_mock_data.sql for Movie Ticket Booking database."""

import random
from datetime import datetime, timedelta
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src/main/resources/db/insert_mock_data.sql"

PWD = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"  # bcrypt: password

GENRES = [
    ("Hành động", "Phim hành động, võ thuật, phiêu lưu"),
    ("Tình cảm", "Phim tình cảm lãng mạn"),
    ("Hài hước", "Phim hài gia đình"),
    ("Kinh dị", "Phim kinh dị, ma, giật gân"),
    ("Hoạt hình", "Phim hoạt hình mọi lứa tuổi"),
    ("Phiêu lưu", "Hành trình khám phá thế giới"),
    ("Khoa học viễn tưởng", "Viễn tưởng, tương lai, không gian"),
    ("Tâm lý", "Phim tâm lý xã hội"),
    ("Tài liệu", "Phim tài liệu thực tế"),
    ("Gia đình", "Phim phù hợp cả gia đình"),
    ("Chiến tranh", "Phim bối cảnh chiến tranh"),
    ("Hình sự", "Điều tra, tội phạm"),
    ("Thể thao", "Phim về thể thao"),
    ("Nhạc kịch", "Musical, ca nhạc"),
    ("Viễn Tây", "Phim cao bồi miền Tây"),
    ("Lịch sử", "Phim cổ trang, lịch sử"),
    ("Giả tưởng", "Thế giới phép thuật"),
    ("Trinh thám", "Phim bí ẩn, điều tra"),
    ("Học đường", "Bối cảnh trường học"),
    ("Kịch tính", "Drama căng thẳng"),
    ("Ly kỳ", "Siêu nhiên, huyền bí"),
    ("Võ thuật", "Kungfu, võ đường"),
    ("Thần thoại", "Thần thoại Hy Lạp, Bắc Âu"),
    ("Tiểu sử", "Chuyển thể tiểu sử"),
    ("Gay cấn", "Thriller, hồi hộp"),
]

MOVIES = [
    ("Mai", "Mai", "Victor Vu", "NOW_SHOWING", "T16", 131, "2024-02-10"),
    ("Lật Mặt 7", "Lat Mat 7", "Lý Hải", "NOW_SHOWING", "T13", 120, "2024-04-26"),
    ("Dune: Part Two", "Dune Part Two", "Denis Villeneuve", "NOW_SHOWING", "T13", 166, "2024-03-01"),
    ("Kung Fu Panda 4", "Kung Fu Panda 4", "Mike Mitchell", "NOW_SHOWING", "P", 94, "2024-03-08"),
    ("Godzilla x Kong", "Godzilla x Kong", "Adam Wingard", "NOW_SHOWING", "T13", 115, "2024-03-29"),
    ("Inside Out 2", "Inside Out 2", "Kelsey Mann", "NOW_SHOWING", "P", 96, "2024-06-14"),
    ("Deadpool & Wolverine", "Deadpool Wolverine", "Shawn Levy", "NOW_SHOWING", "T18", 128, "2024-07-26"),
    ("A Quiet Place: Day One", "A Quiet Place Day One", "Michael Sarnoski", "NOW_SHOWING", "T16", 100, "2024-06-28"),
    ("Mưa Đỏ", "Mua Do", "Đạo diễn VN", "ENDED", "T16", 118, "2023-10-13"),
    ("Đào, Phở và Piano", "Dao Pho va Piano", "Phi Tiến Sơn", "ENDED", "T13", 110, "2024-02-10"),
    ("Avatar: The Way of Water", "Avatar 2", "James Cameron", "ENDED", "T13", 192, "2022-12-16"),
    ("Oppenheimer", "Oppenheimer", "Christopher Nolan", "ENDED", "T16", 180, "2023-07-21"),
    ("Barbie", "Barbie", "Greta Gerwig", "ENDED", "T13", 114, "2023-07-21"),
    ("Nhà Bà Nữ", "Nha Ba Nu", "Trấn Thành", "ENDED", "T13", 117, "2023-10-20"),
    ("Mắt Biếc", "Mat Biec", "Victor Vu", "ENDED", "T13", 117, "2019-12-20"),
    ("Con Nhà Người Ta", "Con Nha Nguoi Ta", "Đạo diễn VN", "COMING_SOON", "T13", 105, "2025-08-15"),
    ("Gladiator II", "Gladiator 2", "Ridley Scott", "COMING_SOON", "T16", 148, "2025-11-22"),
    ("Wicked", "Wicked", "Jon M. Chu", "COMING_SOON", "P", 160, "2025-11-27"),
    ("Moana 2", "Moana 2", "Disney", "COMING_SOON", "P", 100, "2025-11-27"),
    ("Captain America: Brave New World", "Captain America 4", "Julius Onah", "COMING_SOON", "T13", 130, "2025-02-14"),
    ("Joker: Folie à Deux", "Joker 2", "Todd Phillips", "COMING_SOON", "T18", 138, "2024-10-04"),
    ("Venom: The Last Dance", "Venom 3", "Kelly Marcel", "COMING_SOON", "T16", 110, "2024-10-25"),
    ("Transformers One", "Transformers One", "Josh Cooley", "COMING_SOON", "P", 104, "2024-09-20"),
    ("The Wild Robot", "The Wild Robot", "Chris Sanders", "COMING_SOON", "P", 102, "2024-09-27"),
    ("Beetlejuice Beetlejuice", "Beetlejuice 2", "Tim Burton", "COMING_SOON", "T13", 105, "2024-09-06"),
    ("Alien: Romulus", "Alien Romulus", "Fede Alvarez", "COMING_SOON", "T18", 119, "2024-08-16"),
    ("Trốn Chạy Tử Thần 2", "Tron Chay Tu Than 2", "Lý Hải", "COMING_SOON", "T16", 125, "2025-04-30"),
    ("Cô Dâu Ma", "Co Dau Ma", "Đạo diễn VN", "COMING_SOON", "T16", 98, "2025-07-18"),
    ("Sonic 3", "Sonic 3", "Jeff Fowler", "COMING_SOON", "P", 110, "2024-12-20"),
    ("Kraven the Hunter", "Kraven", "J.C. Chandor", "COMING_SOON", "T16", 127, "2024-12-13"),
]

CINEMAS = [
    ("CGV Vincom Center Đồng Khởi", "02838235222", "Quận 1, TP.HCM", "72 Lê Thánh Tôn, Quận 1"),
    ("CGV Giga Mall", "02837362222", "Thủ Đức, TP.HCM", "242 Phạm Văn Đồng, Thủ Đức"),
    ("CGV Aeon Mall Tân Phú", "02862642222", "Tân Phú, TP.HCM", "30 Bờ Bao Tân Thắng, Tân Phú"),
    ("Lotte Cinema Cantavil", "02835172222", "Quận 2, TP.HCM", "1 Song Hành, Quận 2"),
    ("BHD Star Vincom Quang Trung", "02836262222", "Gò Vấp, TP.HCM", "190 Quang Trung, Gò Vấp"),
    ("Galaxy Nguyễn Du", "02838223636", "Quận 1, TP.HCM", "116 Nguyễn Du, Quận 1"),
    ("CGV Vincom Royal City", "02466662222", "Thanh Xuân, Hà Nội", "72A Nguyễn Trãi, Thanh Xuân"),
    ("CGV Tràng Tiền Plaza", "02439362222", "Hoàn Kiếm, Hà Nội", "24 Tràng Tiền, Hoàn Kiếm"),
    ("Lotte Cinema Keangnam", "02438362222", "Nam Từ Liêm, Hà Nội", "E6 Phạm Hùng, Nam Từ Liêm"),
    ("BHD Star Phạm Ngọc Thạch", "02435172222", "Đống Đa, Hà Nội", "2 Phạm Ngọc Thạch, Đống Đa"),
    ("CGV Vincom Đà Nẵng", "02363522222", "Hải Châu, Đà Nẵng", "910A Ngô Quyền, Hải Châu"),
    ("Lotte Cinema Đà Nẵng", "02363652222", "Hải Châu, Đà Nẵng", "6 Nại Nam, Hải Châu"),
    ("CGV Sense City Cà Mau", "02903562222", "Cà Mau", "Số 9, Lý Thường Kiệt, Cà Mau"),
    ("CGV Hùng Vương Plaza", "02838642222", "Quận 5, TP.HCM", "126 Hùng Vương, Quận 5"),
    ("CGV Pandora City", "02839992222", "Tân Phú, TP.HCM", "1/3 Trường Chinh, Tân Phú"),
    ("Beta Cinemas Quang Trung", "02866772222", "Gò Vấp, TP.HCM", "Metro Hiệp Phú, Quang Trung"),
    ("Cinestar Quốc Thanh", "02838272222", "Quận 1, TP.HCM", "271 Nguyễn Trãi, Quận 1"),
    ("DCINE", "02873008888", "Quận 7, TP.HCM", "Lô C-11, Nguyễn Văn Linh, Quận 7"),
    ("Mega GS Cinemas", "02838442222", "Quận 6, TP.HCM", "126 Hùng Vương, Quận 6"),
    ("Starlight D3", "02835118888", "Quận 3, TP.HCM", "Tầng 3, 116 Nguyễn Đình Chiểu"),
    ("CGV Machinco", "02437662222", "Long Biên, Hà Nội", "10 Trần Phú, Long Biên"),
    ("CGV Hà Nội Centerpoint", "02432002222", "Cầu Giấy, Hà Nội", "27 Cao Thắng, Cầu Giấy"),
    ("National Cinema Center", "02435141747", "Cầu Giấy, Hà Nội", "87 Láng Hạ, Cầu Giấy"),
    ("Rạp Bóng Đá Thống Nhất", "02838692222", "Quận 10, TP.HCM", "138 Đồng Đen, Quận 10"),
    ("Cinemax Hòa Bình", "02838382222", "Quận 10, TP.HCM", "199 Đồng Đen, Quận 10"),
]

VN_NAMES = [
    "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Cường", "Phạm Minh Đức", "Hoàng Thị Em",
    "Vũ Quốc Phong", "Đặng Thị Giang", "Bùi Văn Hải", "Đỗ Thị Hoa", "Ngô Văn Khánh",
    "Dương Thị Lan", "Lý Văn Minh", "Mai Thị Ngọc", "Trương Văn Phúc", "Hồ Thị Quỳnh",
    "Võ Văn Sơn", "Đinh Thị Trang", "Cao Văn Uy", "Lương Thị Vy", "Tạ Văn Xuân",
    "Chu Thị Yến", "Phan Văn Bảo", "Lâm Thị Chi", "Hà Văn Dũng", "Kiều Thị Hạnh",
    "Quách Văn Kiên", "Tô Thị Linh", "Vương Văn Nam", "Ông Thị Oanh", "Tăng Văn Phát",
    "Uông Thị Quyên", "Triệu Văn Rạng", "La Thị Sinh", "Mạc Văn Tài", "Ninh Thị Uyên",
    "Ôn Văn Việt", "Quản Thị Xuân", "Sơn Văn Yên", "Thái Thị Ánh", "Ung Văn Bình",
    "Vi Thị Cúc", "Xa Văn Đạt", "Yên Thị Hương", "An Văn Kiệt", "Bạch Thị Loan",
    "Cam Văn Mạnh", "Danh Thị Nhung", "Giang Văn Phước", "Hạ Thị Quế", "Khưu Văn Sĩ",
]

DISTRICTS = [
    ("Phường Bến Nghé", "Quận 1", "Hồ Chí Minh"),
    ("Phường Đa Kao", "Quận 1", "Hồ Chí Minh"),
    ("Phường 4", "Quận 3", "Hồ Chí Minh"),
    ("Phường 12", "Quận 10", "Hồ Chí Minh"),
    ("Phường Hiệp Bình", "Thủ Đức", "Hồ Chí Minh"),
    ("Phường Trung Hòa", "Cầu Giấy", "Hà Nội"),
    ("Phường Hàng Bài", "Hoàn Kiếm", "Hà Nội"),
    ("Phường Thanh Xuân Trung", "Thanh Xuân", "Hà Nội"),
    ("Phường Hải Châu 1", "Hải Châu", "Đà Nẵng"),
    ("Phường Ninh Kiều", "Ninh Kiều", "Cần Thơ"),
]

ROOM_TYPES = ["STANDARD_2D", "PREMIUM_3D", "IMAX", "COUPLE_ROOM", "STANDARD_2D"]
SEAT_TYPES = ["STANDARD", "VIP", "COUPLE", "DISABLED_ACCESS"]


def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("\\", "\\\\").replace("'", "''") + "'"


def dt(d):
    return f"'{d.strftime('%Y-%m-%d %H:%M:%S')}'"


def ddate(d):
    return f"'{d.strftime('%Y-%m-%d')}'"


def bulk_insert(table, columns, rows):
    if not rows:
        return ""
    cols = ", ".join(columns)
    lines = [f"INSERT INTO {table} ({cols}) VALUES"]
    vals = []
    for row in rows:
        vals.append("(" + ", ".join(str(v) for v in row) + ")")
    return lines[0] + "\n" + ",\n".join(vals) + ";\n\n"


def main():
    random.seed(42)
    now = datetime(2025, 6, 23, 12, 0, 0)
    sql = []
    sql.append("-- ============================================================\n")
    sql.append("-- MOCK DATA: Movie Ticket Booking System\n")
    sql.append("-- File: insert_mock_data.sql\n")
    sql.append("-- Password (bcrypt): password\n")
    sql.append("-- ============================================================\n\n")
    sql.append("SET FOREIGN_KEY_CHECKS = 0;\n")

    # 1. genres (25)
    genre_rows = []
    for i, (name, desc) in enumerate(GENRES, 1):
        genre_rows.append((i, esc(name), esc(desc)))
    sql.append(bulk_insert("genres", ["id", "name", "description"], genre_rows))

    # 2. locations (25)
    loc_rows = []
    for i in range(1, 26):
        ward, dist, city = DISTRICTS[(i - 1) % len(DISTRICTS)]
        loc_rows.append((
            i, esc(f"{i * 10} Đường Nguyễn Huệ"), esc(ward), esc(dist), esc(city),
            esc("Việt Nam"), round(10.0 + i * 0.05, 6), round(106.0 + i * 0.03, 6),
            esc(f"place_{i:03d}"), int(now.timestamp() * 1000) - i * 86400000
        ))
    sql.append(bulk_insert(
        "locations",
        ["id", "address", "ward", "district", "city", "country", "latitude", "longitude", "place_id", "updated_at"],
        loc_rows
    ))

    # 3. cinemas (25)
    cinema_rows = []
    for i, (name, phone, area, addr) in enumerate(CINEMAS, 1):
        cinema_rows.append((i, esc(name), esc(phone), esc(area), esc(addr), "'ACTIVE'", i))
    sql.append(bulk_insert("cinemas", ["id", "name", "phone_number", "area", "address", "status", "location_id"], cinema_rows))

    # 4. profile_cards (30) - frequent_cinema_id references cinemas
    pc_rows = []
    for i in range(1, 31):
        pc_rows.append((
            i, 18 + (i % 25), esc(f"https://i.pravatar.cc/150?u={i}"),
            round(0.5 + (i % 50) / 100, 2), esc(VN_NAMES[i - 1].split()[-1]),
            round(1.0 + i * 0.3, 1), 1 if i % 5 != 0 else 0,
            ((i - 1) % 25) + 1
        ))
    sql.append(bulk_insert(
        "profile_cards",
        ["id", "age", "avatar_url", "compatibility_score", "display_name", "distance_in_km", "is_visible_to_customer", "frequent_cinema_id"],
        pc_rows
    ))

    # 5. users (70: 20 admin + 30 customer + 20 staff)
    user_rows = []
    uid = 1
    for i in range(20):
        user_rows.append((
            uid, esc(f"admin{i + 1}@movie.vn"), esc(f"Quản trị viên {i + 1}"), esc(PWD),
            esc(f"0901000{i:03d}"), esc(f"https://i.pravatar.cc/150?u=admin{i}"),
            dt(datetime(1985 + (i % 10), 1, 15)), "'ADMIN'", "'ACTIVE'", dt(now - timedelta(days=365 - i * 10))
        ))
        uid += 1
    for i in range(30):
        user_rows.append((
            uid, esc(f"customer{i + 1}@movie.vn"), esc(VN_NAMES[i]), esc(PWD),
            esc(f"0912{i + 1:06d}"), esc(f"https://i.pravatar.cc/150?u=cust{i}"),
            dt(datetime(1990 + (i % 15), (i % 12) + 1, (i % 28) + 1)),
            "'CUSTOMER'", "'ACTIVE'", dt(now - timedelta(days=300 - i * 5))
        ))
        uid += 1
    for i in range(20):
        user_rows.append((
            uid, esc(f"staff{i + 1}@movie.vn"), esc(VN_NAMES[30 + i]), esc(PWD),
            esc(f"0923{i + 1:06d}"), "NULL",
            dt(datetime(1988 + (i % 10), 6, 1)), "'STAFF'", "'ACTIVE'",
            dt(now - timedelta(days=200 - i * 3))
        ))
        uid += 1
    sql.append(bulk_insert(
        "users",
        ["id", "email", "full_name", "password_hash", "phone_number", "avatar_url", "birth_date", "role", "status", "created_at"],
        user_rows
    ))

    # 6. admins (20)
    admin_rows = [(i,) for i in range(1, 21)]
    sql.append(bulk_insert("admins", ["id"], admin_rows))

    # 7. customers (30) ids 21-50
    cust_rows = []
    for i in range(30):
        cid = 21 + i
        cust_rows.append((cid, (i + 1) * 120, i + 1, ((i % 25) + 1)))
    sql.append(bulk_insert("customers", ["id", "loyalty_points", "profile_card_id", "current_location_id"], cust_rows))

    # 8. staffs (20) ids 51-70
    positions = ["Thu ngân", "Soát vé", "Quản lý ca", "Bán đồ ăn", "Bảo vệ"]
    staff_rows = []
    for i in range(20):
        sid = 51 + i
        staff_rows.append((sid, esc(positions[i % 5]), ((i % 25) + 1)))
    sql.append(bulk_insert("staffs", ["id", "position", "working_cinema_id"], staff_rows))

    CUST = lambda i: 21 + ((i - 1) % 30)   # customer id helper
    STAFF = lambda i: 51 + ((i - 1) % 20)  # staff id helper

    # 9. movies (30)
    movie_rows = []
    for i, (title, en, director, status, age, dur, rel) in enumerate(MOVIES, 1):
        movie_rows.append((
            i, esc(title), esc(en), esc(f"Phim {title} — câu chuyện hấp dẫn về cuộc đời và tình yêu."),
            esc(director), esc("Diễn viên A, Diễn viên B, Diễn viên C"),
            esc("Việt Nam" if i <= 10 else "Mỹ"), esc("Tiếng Việt" if i % 3 == 0 else "Tiếng Anh"),
            esc(age), dur, esc(f"https://picsum.photos/seed/mv{i}/300/450"),
            esc(f"https://picsum.photos/seed/bn{i}/1200/400"), esc("https://youtube.com/watch?v=trailer" + str(i)),
            f"'{rel}'", f"'{status}'"
        ))
    sql.append(bulk_insert(
        "movies",
        ["id", "title", "english_title", "description", "director", "cast", "country", "language",
         "age_rating", "duration", "images", "banner", "trailers", "release_date", "status"],
        movie_rows
    ))

    # 10. movie_genres (~60)
    mg_rows = []
    mg_id = 0
    for mid in range(1, 31):
        g1 = ((mid - 1) % 25) + 1
        g2 = (mid % 25) + 1
        mg_rows.append((mid, g1))
        if g2 != g1:
            mg_rows.append((mid, g2))
    sql.append(bulk_insert("movie_genres", ["movie_id", "genre_id"], mg_rows))

    # 11. rooms (25)
    room_rows = []
    for i in range(1, 26):
        room_rows.append((
            i, esc(f"Phòng {chr(64 + ((i - 1) % 5) + 1)}"), esc(f"CIN{i:02d}-R{i}"),
            50, f"'{ROOM_TYPES[(i - 1) % len(ROOM_TYPES)]}'", "'ACTIVE'", i
        ))
    sql.append(bulk_insert("rooms", ["id", "name", "room_code", "seat_count", "room_type", "status", "cinema_id"], room_rows))

    # 12. seats (50 per room = 1250 - too many; use 50 total: 2 rows x 5 cols x 5 rooms = 50)
    # User wants 20-50 per table - exactly 50 seats across rooms 1-5
    seat_rows = []
    sid = 1
    for room_id in range(1, 6):
        for row in ["A", "B"]:
            for col in range(1, 6):
                st = "VIP" if row == "B" else "STANDARD"
                seat_rows.append((sid, col, esc(row), f"'{st}'", "'AVAILABLE'", room_id))
                sid += 1
    # add more seats in rooms 6-25 to reach at least 50 per... user said 20-50. 50 is enough for seats table.
    # Extend to 50 seats only - done (5 rooms * 10 = 50)
    sql.append(bulk_insert("seats", ["id", "column_number", "row_label", "seat_type", "status", "room_id"], seat_rows))

    # 13. vouchers (30)
    vtypes = ["PERCENT_DISCOUNT", "BUY_N_GET_FREE", "MIN_TICKET_DISCOUNT"]
    v_rows = []
    for i in range(1, 31):
        vt = vtypes[(i - 1) % 3]
        dp = 10 + (i % 15) if vt != "BUY_N_GET_FREE" else "NULL"
        bq = 2 if vt == "BUY_N_GET_FREE" else "NULL"
        fq = 1 if vt == "BUY_N_GET_FREE" else "NULL"
        mt = 3 if vt == "MIN_TICKET_DISCOUNT" else "NULL"
        v_rows.append((
            i, esc(f"Ưu đãi tháng {i}"), esc(f"VOUCHER{i:03d}"), esc(f"Mã giảm giá {i} cho khách hàng thân thiết"),
            0, 150000 + i * 5000, 100 + i * 10, i % 20,
            dt(now - timedelta(days=60)), dt(now + timedelta(days=90)), "'ACTIVE'", f"'{vt}'",
            dp if dp != "NULL" else "NULL", bq, fq, mt
        ))
    sql.append(bulk_insert(
        "vouchers",
        ["id", "name", "code", "description", "discount_value", "minimum_order_amount", "usage_limit", "used_count",
         "start_time", "end_time", "status", "voucher_type", "discount_percent", "buy_quantity", "free_quantity", "min_tickets"],
        v_rows
    ))

    # 14. voucher_movies (60)
    vm_rows = []
    for vid in range(1, 31):
        vm_rows.append((vid, ((vid - 1) % 10) + 1))
        vm_rows.append((vid, ((vid) % 15) + 1))
    sql.append(bulk_insert("voucher_movies", ["voucher_id", "movie_id"], vm_rows))

    # 15. voucher_cinemas (50)
    vc_rows = []
    for vid in range(1, 26):
        vc_rows.append((vid, vid))
        vc_rows.append((vid, (vid % 25) + 1))
    sql.append(bulk_insert("voucher_cinemas", ["voucher_id", "cinema_id"], vc_rows))

    # 16. showtimes (30)
    show_rows = []
    slots = [9, 11, 14, 16, 19, 21]
    for i in range(1, 31):
        movie_id = ((i - 1) % 8) + 1  # NOW_SHOWING movies 1-8
        cinema_id = ((i - 1) % 25) + 1
        room_id = ((i - 1) % 5) + 1  # rooms with seats
        day_offset = (i % 14) - 7
        hour = slots[i % len(slots)]
        start = now.replace(hour=hour, minute=30, second=0) + timedelta(days=day_offset)
        end = start + timedelta(minutes=130)
        status = "FINISHED" if start < now - timedelta(hours=3) else "AVAILABLE"
        if i % 11 == 0:
            status = "SOLD_OUT"
        price = 65000 + (i % 5) * 10000
        show_rows.append((i, dt(start), dt(end), price, f"'{status}'", cinema_id, room_id, movie_id))
    sql.append(bulk_insert(
        "showtimes",
        ["id", "start_time", "end_time", "base_price", "status", "cinema_id", "room_id", "movie_id"],
        show_rows
    ))

    # 17. swipes (40) — 20 cặp RIGHT cho matches + 20 LEFT
    swipe_rows = []
    for m in range(1, 21):
        ca = CUST(m)
        cb = CUST(m + 10)
        swipe_rows.append((2 * m - 1, "'RIGHT'", dt(now - timedelta(days=m)), ca, cb))
        swipe_rows.append((2 * m, "'RIGHT'", dt(now - timedelta(days=m)), cb, ca))
    for i in range(1, 21):
        swiper = CUST(i + 5)
        target = CUST(i)
        swipe_rows.append((40 + i, "'LEFT'", dt(now - timedelta(days=i + 5)), swiper, target))
    # chỉ lấy 40 swipe đầu (bỏ LEFT nếu trùng id) — dùng đúng 40 dòng
    swipe_rows = swipe_rows[:40]
    sql.append(bulk_insert("swipes", ["id", "direction", "swiped_at", "swiper_id", "target_id"], swipe_rows))

    # 18. matches (20)
    match_rows = []
    for m in range(1, 21):
        ca = CUST(m)
        cb = CUST(m + 10)
        match_rows.append((m, 1000 + m, dt(now - timedelta(days=m * 2)), "'ACTIVE'", ca, cb, 2 * m - 1, 2 * m))
    sql.append(bulk_insert(
        "matches",
        ["id", "conversation_id", "matched_at", "status", "customer_a_id", "customer_b_id", "swipe_a_id", "swipe_b_id"],
        match_rows
    ))

    # 19. messages (40)
    msg_rows = []
    contents = [
        "Chào bạn, bạn thích xem phim gì?", "Mình thích phim hành động!", "Cuối tuần đi xem phim nhé?",
        "Ok, mình book vé luôn!", "Suất 19h30 nhé?", "Đã thanh toán xong rồi!", "Hẹn gặp ở sảnh rạp!",
        "Mình đến sớm 15 phút nhé", "Phim hay quá!", "Bạn xem trailer chưa?"
    ]
    for i in range(1, 41):
        mid = ((i - 1) % 20) + 1
        sender = CUST(i)
        shared = "NULL" if i % 5 != 0 else ((i % 8) + 1)
        msg_rows.append((
            i, esc(contents[(i - 1) % len(contents)]), 1000 + mid,
            dt(now - timedelta(hours=i * 3)), 1 if i % 3 == 0 else 0, mid, sender, shared
        ))
    sql.append(bulk_insert(
        "messages",
        ["id", "content", "conversation_id", "sent_at", "is_read", "match_id", "sender_id", "shared_movie_id"],
        msg_rows
    ))

    # 20. group_booking_sessions (25)
    gbs_rows = []
    for i in range(1, 26):
        st_id = ((i - 1) % 20) + 1
        gbs_rows.append((
            i, 2000 + i, dt(now - timedelta(hours=i)), dt(now + timedelta(hours=2)), st_id
        ))
    sql.append(bulk_insert(
        "group_booking_sessions",
        ["id", "conversation_id", "created_at", "expires_at", "showtime_id"],
        gbs_rows
    ))

    # Track occupied seats per showtime
    occupied = {i: set() for i in range(1, 31)}

    def pick_seat(showtime_id, booking_idx):
        room_idx = ((showtime_id - 1) % 5) + 1
        base = (room_idx - 1) * 10
        for s in range(10):
            seat_id = base + s + 1
            if seat_id not in occupied[showtime_id]:
                occupied[showtime_id].add(seat_id)
                return seat_id
        return base + (booking_idx % 10) + 1

    # 21. bookings (30)
    book_rows = []
    statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "CANCELLED", "EXPIRED"]
    for i in range(1, 31):
        st_id = ((i - 1) % 30) + 1
        cust = CUST(i)
        st = statuses[i % len(statuses)]
        voucher = i if i <= 10 and st == "CONFIRMED" else "NULL"
        gbs = i if i <= 15 else "NULL"
        # get showtime start from generation pattern
        day_offset = (st_id % 14) - 7
        hour = slots[st_id % len(slots)]
        show_start = now.replace(hour=hour, minute=30, second=0) + timedelta(days=day_offset)
        book_date = show_start - timedelta(hours=24 + (i % 12))
        tickets_n = 1 + (i % 3)
        price = 65000 + (st_id % 5) * 10000
        base = price * tickets_n
        disc = 15000 if voucher != "NULL" else 0
        sub = base - disc
        book_rows.append((
            i, dt(book_date), dt(book_date + timedelta(minutes=15)),
            base, disc, sub, sub, f"'{st}'", cust, st_id, voucher, gbs
        ))
    sql.append(bulk_insert(
        "bookings",
        ["id", "booking_date", "payment_deadline", "base_price", "discount_amount", "subtotal", "total_amount",
         "status", "customer_id", "showtime_id", "voucher_id", "group_booking_session_id"],
        book_rows
    ))

    # 22. seat_holds (25)
    hold_rows = []
    for i in range(1, 26):
        st_id = ((i - 1) % 30) + 1
        seat_id = pick_seat(st_id, i + 100)
        hold_rows.append((
            i, dt(now - timedelta(minutes=i * 5)), seat_id, CUST(i),
            st_id, i if i <= 15 else "NULL", i if i <= 20 else "NULL"
        ))
    sql.append(bulk_insert(
        "seat_holds",
        ["id", "hold_time", "seat_id", "customer_id", "showtime_id", "group_booking_session_id", "booking_id"],
        hold_rows
    ))

    # 23. tickets (50)
    ticket_rows = []
    tid = 1
    staff_ids = list(range(51, 71))
    for bid in range(1, 31):
        row = book_rows[bid - 1]
        st = row[7].strip("'")
        if st in ("CANCELLED", "EXPIRED"):
            continue
        st_id = row[9]
        cust = row[8]
        tickets_n = 1 + (bid % 3)
        for _ in range(tickets_n):
            if tid > 50:
                break
            seat_id = pick_seat(st_id, tid)
            tstatus = "USED" if st_id <= 10 else "ISSUED"
            staff = staff_ids[tid % 20] if tstatus == "USED" else "NULL"
            ticket_rows.append((
                tid, esc(f"TKT-{tid:05d}"), esc(f"CFM{tid:06d}"), esc(f"QR-TKT-{tid:05d}"),
                dt(now - timedelta(days=tid)), f"'{tstatus}'", bid, cust, st_id, seat_id, staff
            ))
            tid += 1
    sql.append(bulk_insert(
        "tickets",
        ["id", "ticket_code", "confirmation_code", "qr_code", "issued_at", "status",
         "booking_id", "customer_id", "showtime_id", "seat_id", "checked_by_staff_id"],
        ticket_rows
    ))

    # 24. participant_payments (25)
    pp_rows = []
    for i in range(1, 26):
        pp_rows.append((
            i, 65000 + i * 2000, CUST(i), i, i
        ))
    sql.append(bulk_insert(
        "participant_payments",
        ["id", "amount", "customer_id", "group_booking_session_id", "seat_hold_id"],
        pp_rows
    ))

    # 25. payments (30)
    pay_rows = []
    methods = ["MOMO", "VNPAY", "CASH", "BANK_CARD"]
    pid = 1
    for bid in range(1, 31):
        row = book_rows[bid - 1]
        if row[7].strip("'") != "CONFIRMED":
            continue
        if pid > 30:
            break
        pay_rows.append((
            pid, row[6], esc(f"TXN{pid:010d}"), dt(now - timedelta(days=pid)),
            f"'{methods[pid % 4]}'", "'PAID'", bid, "NULL"
        ))
        pid += 1
    # fill to 30 with participant payments
    while len(pay_rows) < 30:
        n = len(pay_rows) + 1
        pay_rows.append((
            n, 70000, esc(f"GRPTXN{n:010d}"), dt(now - timedelta(days=n)),
            f"'{methods[n % 4]}'", "'PAID'", "NULL", n
        ))
    sql.append(bulk_insert(
        "payments",
        ["id", "amount", "transaction_code", "paid_at", "payment_method", "status", "booking_id", "participant_payment_id"],
        pay_rows
    ))

    # 26. reviews (30)
    rev_rows = []
    for i in range(1, 31):
        rev_rows.append((
            i, 3 + (i % 3), esc(f"Phim rất hay, đáng xem! Đánh giá {i}."),
            dt(now - timedelta(days=i * 2)), "'VISIBLE'", ((i - 1) % 15) + 1, CUST(i)
        ))
    sql.append(bulk_insert(
        "reviews",
        ["id", "rating", "comment", "created_at", "status", "movie_id", "customer_id"],
        rev_rows
    ))

    # 27. movie_histories (30)
    mh_rows = []
    for i in range(1, 31):
        day_offset = -i * 3
        watched = now + timedelta(days=day_offset)
        mh_rows.append((
            i, dt(watched), dt(watched), ((i - 1) % 15) + 1, CUST(i), ((i - 1) % 25) + 1
        ))
    sql.append(bulk_insert(
        "movie_histories",
        ["id", "watched_at", "showtime", "movie_id", "customer_id", "cinema_id"],
        mh_rows
    ))

    # 28. movie_dates (25)
    md_rows = []
    md_status = ["PROPOSED", "ACCEPTED", "REJECTED", "CANCELLED", "ACCEPTED"]
    for i in range(1, 26):
        md_rows.append((
            i, dt(now - timedelta(days=i)), f"'{md_status[i % 5]}'",
            CUST(i), ((i - 1) % 8) + 1, ((i - 1) % 30) + 1,
            ((i - 1) % 20) + 1, i
        ))
    sql.append(bulk_insert(
        "movie_dates",
        ["id", "proposed_at", "status", "proposer_id", "movie_id", "showtime_id", "match_id", "group_booking_session_id"],
        md_rows
    ))

    # 29. notifications (30)
    ntypes = ["REGISTER_SUCCESS", "BOOKING_SUCCESS", "PAYMENT_SUCCESS", "PAYMENT_FAILED",
              "TICKET_CANCELLED", "SHOWTIME_CHANGED", "GROUP_BOOKING_STATUS"]
    notif_rows = []
    for i in range(1, 31):
        uid = CUST(i) if i % 4 != 0 else STAFF(i)
        notif_rows.append((
            i, esc(f"Thông báo #{i}"), esc(f"Bạn có thông báo mới liên quan đến đặt vé số {i}."),
            dt(now - timedelta(hours=i * 5)), 1 if i % 2 == 0 else 0,
            f"'{ntypes[i % len(ntypes)]}'", uid
        ))
    sql.append(bulk_insert(
        "notifications",
        ["id", "title", "content", "sent_at", "is_read", "type", "user_id"],
        notif_rows
    ))

    # 30. system_logs (30)
    actions = ["LOGIN", "BOOKING_CREATED", "PAYMENT_PROCESSED", "TICKET_CANCELLED",
               "MOVIE_UPDATED", "SHOWTIME_UPDATED", "PERMISSION_CHANGED", "SYSTEM_ERROR"]
    levels = ["INFO", "WARNING", "ERROR", "DEBUG"]
    log_rows = []
    for i in range(1, 31):
        actor = (i % 20) + 1 if i % 10 == 0 else CUST(i)
        log_rows.append((
            i, esc(f"Sự kiện hệ thống #{i}: thao tác người dùng."),
            dt(now - timedelta(days=i)), 1 if i % 8 == 0 else 0,
            f"'{actions[i % len(actions)]}'", f"'{levels[i % len(levels)]}'", actor
        ))
    sql.append(bulk_insert(
        "system_logs",
        ["id", "description", "created_at", "is_security_event", "action", "level", "actor_id"],
        log_rows
    ))

    sql.append("SET FOREIGN_KEY_CHECKS = 1;\n\n")
    sql.append("-- ============================================================\n")
    sql.append("-- TONG KET: 30 bang | Mat khau test: password\n")
    sql.append("-- Admin: admin1@movie.vn .. admin20@movie.vn\n")
    sql.append("-- Customer: customer1@movie.vn .. customer30@movie.vn\n")
    sql.append("-- Staff: staff1@movie.vn .. staff20@movie.vn\n")
    sql.append("-- Chay: mysql -u root -p ticketmovie_db < insert_mock_data.sql\n")
    sql.append("-- ============================================================\n")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(sql), encoding="utf-8")
    print(f"Written: {OUT}")
    print(f"Size: {OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
