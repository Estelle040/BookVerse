package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "club_id",
                                "book_id"
                        }
                )
        }
)
@Getter
@Setter
public class ReadingProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
    @ManyToOne
    @JoinColumn(name = "club_id")
    private Club club;
    @Column
    private int current_page;
    @Column
    private LocalDateTime updated_at;
    @Enumerated(EnumType.STRING)
    private ReadingStatus status;
}
