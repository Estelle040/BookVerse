package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookRepository extends JpaRepository<Book, UUID> {
    Optional<Book> findByTitle(String name);
    Optional<Book> findBooksByAuthor(String author);
}
