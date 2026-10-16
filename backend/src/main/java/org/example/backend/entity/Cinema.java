package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.CinemaStatus;

import java.util.List;

@Entity
@Table(name = "cinemas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // cinemaId

    private String name;
    private String phoneNumber;
    private String area;

    // Thuộc tính address trong sơ đồ có thể dùng String hoặc lấy từ Location
    private String address;

    @Enumerated(EnumType.STRING)
    private CinemaStatus status;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "location_id", referencedColumnName = "id")
    private Location location;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL)
    private List<Room> rooms;

    @OneToMany(mappedBy = "cinema")
    private List<Showtime> showtimes;

    // Quan hệ với Staff (Đã tạo ở Phần 1 - Giờ bạn có thể qua class Staff để mở comment field workingCinema)
    @OneToMany(mappedBy = "workingCinema")
    private List<Staff> staffs;


    @ManyToMany(mappedBy = "applicableCinemas") // Đúng tên biến bên class Voucher
    private List<Voucher> vouchers;

    // Thêm vào class Cinema
    @ManyToMany(mappedBy = "frequentCinemas")
    private List<Customer> frequentCustomers;

}
