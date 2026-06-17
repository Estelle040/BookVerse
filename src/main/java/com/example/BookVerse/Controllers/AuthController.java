package com.example.BookVerse.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @GetMapping("/auth")
    public String auth() {
        return "Welcome to BookVerse";
    }
}
