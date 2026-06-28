package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Club;
import com.example.BookVerse.Repository.Entity.ClubMember;
import com.example.BookVerse.Repository.Entity.MemberStatus;
import com.example.BookVerse.Repository.Entity.User;
import com.example.BookVerse.dto.ClubDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember,Long> {
    boolean existsByUserAndClub(User user, Club club);

    Optional<ClubMember> findByUserAndClub(User user, Club club);

    List<ClubMember> findByUser(User user);

    Optional<ClubMember> findByClubAndUser(Club club, User user);
}
