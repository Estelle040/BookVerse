package com.example.BookVerse.Mapper;

import com.example.BookVerse.Repository.Entity.Book;
import com.example.BookVerse.dto.BookDTO;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookDTO.SaveBookDTO toSaveBookDTO(Book book) {
        return new BookDTO.SaveBookDTO(
                book.getTitle(),
                book.getAuthor(),
                book.getPages(),
                book.getDescription()
        );
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
