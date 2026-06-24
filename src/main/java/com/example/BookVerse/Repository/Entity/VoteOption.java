package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class VoteOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vote_session_id")
    private VoteSession voteSession;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
}
