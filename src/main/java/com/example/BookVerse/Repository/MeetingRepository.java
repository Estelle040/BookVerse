package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByClubId(Long clubId);
}