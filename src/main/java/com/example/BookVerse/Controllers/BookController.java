package com.example.BookVerse.Controllers;

import com.example.BookVerse.Mapper.BookMapper;
import com.example.BookVerse.Repository.Entity.Book;
import com.example.BookVerse.Service.BookService;
import com.example.BookVerse.Service.ProgressService;
import com.example.BookVerse.dto.BookDTO;
import com.example.BookVerse.dto.ProgressDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final BookMapper bookMapper;
    private final ProgressService progressService;

    
    @PostMapping(
            value = "/{id}/cover",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Book> uploadCover(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {

        return ResponseEntity.ok(
                bookService.uploadCover(id, file)
        );
    }

    
    @PostMapping(value = "/save")
    public ResponseEntity<BookDTO.SaveBookDTO> save(
            @RequestBody BookDTO.SaveBookDTO bookDTO
    ) {
        return ResponseEntity.ok(bookMapper.toSaveBookDTO(bookService.saveBook(bookDTO)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findAll() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findByTitle(@PathVariable String title) {
        return ResponseEntity.ok(bookService.getBooksByTitle(title));
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findByAuthor(@PathVariable String author) {
        return ResponseEntity.ok(bookService.getBooksByAuthor(author));
    }

    @GetMapping("/progress/my")
    public ResponseEntity<List<ProgressDTO.ProgressViewDTO>> findMyProgress() {
        return ResponseEntity.ok(progressService.getMyProgress());
    }

    @PostMapping("/progress/update")
    public ResponseEntity<String> updateProgress(
            @RequestBody ProgressDTO.UpdateProgressDTO progressDTO
    ) {
        progressService.updateProgress(progressDTO);
        return ResponseEntity.ok("Progress updated successfully");
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<BookDTO.ListBookDTO> updateBook(
            @PathVariable UUID id,
            @RequestBody BookDTO.UpdateBookDTO updateBookDTO
    ) {
        return ResponseEntity.ok(bookService.updateBook(id, updateBookDTO));
    }

}
