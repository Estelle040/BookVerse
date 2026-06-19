package com.example.BookVerse.Controllers;

import com.example.BookVerse.Service.AuthService;
import com.example.BookVerse.dto.AuthDTO;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public void register(@RequestBody AuthDTO.RegisterRequest req) {
        service.register(req);
    }

    @PostMapping("/login")
    public AuthDTO.AuthResponse login(@RequestBody AuthDTO.LoginRequest req) {
        return service.login(req);
    }
}