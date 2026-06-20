package com.example.BookVerse.dto;

public class BookDTO {
    public record SaveBookDTO(String title, String author, int pages, String description) {}
}
