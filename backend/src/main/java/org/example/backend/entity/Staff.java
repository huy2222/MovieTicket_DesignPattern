package org.example.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "staffs")
@Data
@EqualsAndHashCode(callSuper = true)
public class Staff extends User {
    private String position;

    @ManyToOne
    @JoinColumn(name = "working_cinema_id")
    private Cinema workingCinema;

    public Staff() {
        super();
    }

    public Staff(String position, Cinema workingCinema) {
        super();
        this.position = position;
        this.workingCinema = workingCinema;
    }
}
