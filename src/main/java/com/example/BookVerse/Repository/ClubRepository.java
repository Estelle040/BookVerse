package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClubRepository extends JpaRepository<Club, Integer> {
    Optional<Club> findById(Long clubId);
}
