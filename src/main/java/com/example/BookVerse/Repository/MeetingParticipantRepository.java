package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Meeting;
import com.example.BookVerse.Repository.Entity.MeetingParticipant;
import com.example.BookVerse.Repository.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    Optional<MeetingParticipant> findByMeetingAndUser(Meeting meeting, User user);
    List<MeetingParticipant> findByMeeting(Meeting meeting);
}
