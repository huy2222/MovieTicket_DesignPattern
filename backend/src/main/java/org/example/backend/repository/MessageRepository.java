package org.example.backend.repository;

import org.example.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    boolean existsBySharedMovie_Id(Long movieId);
}
