package com.example.BookVerse.dto;

import java.util.UUID;

public class BookDTO {
    public record SaveBookDTO(UUID id, String title, String author, int pages, String description) {}
    public record ListBookDTO(UUID id, String title, String author, int pages, String description, String coverUrl) {}
    public record UpdateBookDTO(String title, String author, int pages, String description) {}
}
