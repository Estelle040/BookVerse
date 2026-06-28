package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;

    @Column
    private String title;
    @Column
    private String description;
    @Column
    private LocalDateTime meeting_time;
    @Column
    private String location; // как виртуальное пространство, так и локация на карте
    @Enumerated(EnumType.STRING)
    private MeetingStatus status;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}

