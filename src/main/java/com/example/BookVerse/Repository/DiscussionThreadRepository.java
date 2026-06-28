package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {

    List<DiscussionThread> findByClubId(Long clubId);

    Optional<DiscussionThread> findByClubIdAndBookId(Long clubId, UUID bookId);
}