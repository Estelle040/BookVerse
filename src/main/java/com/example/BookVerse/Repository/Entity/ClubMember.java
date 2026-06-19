package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
public class ClubMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Club club;

    @Column
    private LocalDateTime joinDate;

    @Enumerated(EnumType.STRING)
    private Status status;
}

enum Status {
    ACTIVE,
    LEFT,
    BANNED
}