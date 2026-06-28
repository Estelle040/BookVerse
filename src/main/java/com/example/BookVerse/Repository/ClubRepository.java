package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Club;
import com.example.BookVerse.Repository.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClubRepository extends JpaRepository<Club, Integer> {
    Optional<Club> findById(Long clubId);

    Optional<Club> findByOwnerUserAndName(User ownerUser, String name);

    Optional<Club> findByName(String s);
}
