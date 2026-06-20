package com.example.BookVerse.dto;

import com.example.BookVerse.Repository.Entity.MemberStatus;

public class ClubDTO {
    public record saveClubDto(String name, String description, boolean isPrivate) {}
    public record ListClubDto(String name, String description, boolean isPrivate) {}
    public record clubMember(String login, MemberStatus status){}
}
