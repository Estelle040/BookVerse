package com.example.BookVerse.Repository.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Table
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_user_id")
    private User ownerUser;

    @CreationTimestamp
    private Date created;

    @Column(nullable = false)
    private boolean isPrivate;

    @OneToMany(mappedBy = "club")
    private List<ClubMember> members;

    @OneToMany(mappedBy = "club")
    private List<VoteSession> voteSessions;

    @ManyToMany
    @JoinTable(
            name = "club_books",
            joinColumns = @JoinColumn(name = "club_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> books = new ArrayList<>();
}
