package org.example.backend.repository;

import org.example.backend.entity.ProfileCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileCardRepository extends JpaRepository<ProfileCard, Long> {
}
