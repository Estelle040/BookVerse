package com.example.BookVerse.Mapper;

import com.example.BookVerse.Repository.Entity.BookVote;
import com.example.BookVerse.Repository.Entity.VoteOption;
import com.example.BookVerse.Repository.Entity.VoteSession;
import com.example.BookVerse.dto.VoteDTO;
import org.springframework.stereotype.Component;

@Component
public class VoteMapper {
    public VoteDTO.startVote toStartVoteDTO(VoteSession voteSession) {
        return new VoteDTO.startVote(
                voteSession.getTitle(),
                voteSession.getStartDate(),
                voteSession.getEndDate(),
                voteSession.getClub().getName(),
                voteSession.getDescription()
        );
    }

    public VoteDTO.shortVoteDTO toShortVoteDTO(VoteSession voteSession) {
        return new VoteDTO.shortVoteDTO(
                voteSession.getTitle(),
                voteSession.getDescription(),
                voteSession.getVotes()
                        .stream()
                        .map(option -> option.getBook().getTitle())
                        .toList(),
                voteSession.getStartDate(),
                voteSession.getEndDate()
        );
    }

    public VoteDTO.votedBookDTO toVotedBookDTO(BookVote bookVote) {
        return new VoteDTO.votedBookDTO(
                bookVote.getVoteOption().getVoteSession().getTitle(),
                bookVote.getVoteOption().getBook().getTitle()
        );
    }
}
