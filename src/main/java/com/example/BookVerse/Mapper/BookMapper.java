package com.example.BookVerse.Mapper;

import com.example.BookVerse.Repository.Entity.Book;
import com.example.BookVerse.dto.BookDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {
    private static ObjectMapper objectMapper = new ObjectMapper();

    public BookMapper(ObjectMapper objectMapper) {
        BookMapper.objectMapper = objectMapper;
    }

    public static BookDTO.SaveBookDTO parseBookData(String data) {
        try {
            return objectMapper.readValue(data, BookDTO.SaveBookDTO.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalArgumentException("Invalid book data JSON");
        }
    }

    public BookDTO.ListBookDTO toDto(Book book) {
        return new BookDTO.ListBookDTO(
                book.getTitle(),
                book.getAuthor(),
                book.getPages(),
                book.getDescription(),
                book.getCover()
        );
    }
}
