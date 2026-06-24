package com.example.BookVerse.dto;

import com.example.BookVerse.Repository.Entity.VoteOption;

import java.time.LocalDateTime;
import java.util.List;

public class VoteDTO {
    public record startVote(String name, LocalDateTime start, LocalDateTime end, String club_name, String description) {}
    public record endVote(String name, LocalDateTime end, String club_name, String description) {}
    public record shortVoteDTO(String name, String description, List<VoteOption> optionList) {}
}
