package com.example.BookVerse.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DiscussionDTO {

    public record CreateThreadDTO(
            Long clubId,
            UUID bookId,
            String title
    ) {}

    public record ThreadResponseDTO(
            Long id,
            String title,
            String bookTitle,
            LocalDateTime createdAt
    ) {}

    public record MessageDTO(
            Long threadId,
            String message
    ) {}

    public record MessageResponseDTO(
            String username,
            String message,
            LocalDateTime createdAt
    ) {}
}