package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.BookMapper;
import com.example.BookVerse.Repository.BookRepository;
import com.example.BookVerse.Repository.Entity.Book;
import com.example.BookVerse.dto.BookDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final FileStorageService fileStorageService;
    private final BookMapper bookMapper;

    public Book uploadCover(UUID book_id, MultipartFile file) {
        Book book = bookRepository.findById(book_id)
                .orElseThrow(() ->new RuntimeException("Book not found"));

        String fileName = fileStorageService.storeFile(file);

        book.setCover("/uploads/books/" + fileName);
        return bookRepository.save(book);
    }

    public Book saveBook(BookDTO.SaveBookDTO saveBookDTO, MultipartFile file) {
        Book book = new Book();
        book.setTitle(saveBookDTO.title());
        book.setAuthor(saveBookDTO.author());
        book.setPages(saveBookDTO.pages());
        book.setDescription(saveBookDTO.description());
        book = bookRepository.save(book);
        if(file != null && !file.isEmpty()) {
            book = uploadCover(book.getId(), file);
        }
        return book;
    }

    public List<BookDTO.ListBookDTO> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(bookMapper::toDto)
                .toList();
    }

    public List<BookDTO.ListBookDTO> getBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title)
                .stream()
                .map(bookMapper::toDto)
                .toList();
    }

    public List<BookDTO.ListBookDTO> getBooksByAuthor(String author) {
        return bookRepository.findByTitleContainingIgnoreCase(author)
                .stream()
                .map(bookMapper::toDto)
                .toList();
    }
}
