package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Club;
import com.example.BookVerse.Repository.Entity.VoteSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoteSessionRepository extends JpaRepository<VoteSession, Long> {

    Optional<VoteSession> findVoteSessionByClub(Club club);
}