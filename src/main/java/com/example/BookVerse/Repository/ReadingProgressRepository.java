package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.ReadingProgress;
import com.example.BookVerse.Repository.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {

    Optional<ReadingProgress> findByClubIdAndBookId(Long clubId, UUID bookId);

    List<ReadingProgress> findByUser(User user);
}