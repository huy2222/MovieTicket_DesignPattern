package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "genres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // genreId

    private String name;
    private String description;

    @ManyToMany(mappedBy = "genres")
    private List<Movie> movies;




    // Thêm vào class Genre
    @ManyToMany(mappedBy = "favoriteGenres")
    private List<Customer> favoriteCustomers;
}
