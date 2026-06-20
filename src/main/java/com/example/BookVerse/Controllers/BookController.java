package com.example.BookVerse.Controllers;

import com.example.BookVerse.Mapper.BookMapper;
import com.example.BookVerse.Repository.Entity.Book;
import com.example.BookVerse.Service.BookService;
import com.example.BookVerse.dto.BookDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

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


    @Operation(
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE
                    )
            )
    )
    @PostMapping(
            value = "/save",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Book> save(
            @RequestParam("data") String data,
            @RequestPart(value = "cover", required = false) MultipartFile cover
    ) {
        BookDTO.SaveBookDTO dto = BookMapper.parseBookData(data);

        return ResponseEntity.ok(bookService.saveBook(dto, cover));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findAll() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/find/{title}")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findByTitle(@PathVariable String title) {
        return ResponseEntity.ok(bookService.getBooksByTitle(title));
    }

    @GetMapping("/find/{author}")
    public ResponseEntity<List<BookDTO.ListBookDTO>> findByAuthor(@PathVariable String author) {
        return ResponseEntity.ok(bookService.getBooksByAuthor(author));
    }

}
