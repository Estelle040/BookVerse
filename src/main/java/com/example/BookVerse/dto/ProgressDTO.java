package com.example.BookVerse.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProgressDTO {

    public record ProgressViewDTO(
            Long id,
            String username,
            String bookTitle,
            Long clubId,
            int currentPage,
            LocalDateTime updatedAt
    ) {}

    public record UpdateProgressDTO(
            Long clubId,
            UUID bookId,
            int currentPage
    ) {}
}