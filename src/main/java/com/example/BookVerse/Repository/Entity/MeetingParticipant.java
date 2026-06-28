package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table
@Data
public class MeetingParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private boolean willAttend;
}