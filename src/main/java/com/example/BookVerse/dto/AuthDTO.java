package com.example.BookVerse.dto;

import com.example.BookVerse.Repository.Entity.Role;

public class AuthDTO {
    public record RegisterRequest(String login, String password, String role) {}
    public record LoginRequest(String login, String password) {}
    public record AuthResponse(String token) {}
}
