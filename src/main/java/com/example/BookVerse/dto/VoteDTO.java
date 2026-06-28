package com.example.BookVerse.dto;

import com.example.BookVerse.Repository.Entity.Book;

import java.time.LocalDateTime;
import java.util.List;

public class VoteDTO {
    public record startVote(String name, LocalDateTime start, LocalDateTime end, String club_name, String description) {}
    public record shortVoteDTO(Long id, String name, String description, List<String> optionList, LocalDateTime start, LocalDateTime end, String status) {}
    public record VoteResultDTO(
            String voteTitle,
            List<OptionResult> results
    ) {
        public record OptionResult(
                String bookTitle,
                Long score
        ) {}
    }
    public record votedBookDTO(String vote_name, String book_name){}

    public record VoteFinishedEvent(
            Long voteId,
            Long clubId,
            Book winnerBook
    ) {}
}
