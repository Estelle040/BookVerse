package com.example.BookVerse.Mapper;

import com.example.BookVerse.dto.BookDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;


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
}
