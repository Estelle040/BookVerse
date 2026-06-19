package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.net.URL;
import java.util.List;

@Setter
@Getter
@Entity
@Table
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String title;

    @Column
    private String author;

    @Column(unique = true)
    private String description;

    @Column
    private URL cover;

    @OneToMany(mappedBy = "book")
    private List<BookVote> votes;
}
