package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.DiscussionMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionMessageRepository extends JpaRepository<DiscussionMessage, Long> {

    List<DiscussionMessage> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}