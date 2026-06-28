package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table
public class Book {
    @Id
    @UuidGenerator
    private UUID id;

    @Column(unique = true)
    private String title;

    @Column
    private String author;

    @Column(unique = true)
    private String description;

    @Column
    private String cover;

    @Column
    private int pages;
}
