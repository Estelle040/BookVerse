package com.example.BookVerse.Repository.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Getter
    @Id
    @UuidGenerator
    private UUID id;

    @Column(unique = true, nullable = false)
    @Getter
    @Setter
    private String login;
    @Column(nullable = false)
    @Getter
    @Setter
    private String password;

    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

}
