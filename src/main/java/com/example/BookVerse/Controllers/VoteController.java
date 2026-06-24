package com.example.BookVerse.Controllers;

import com.example.BookVerse.Mapper.VoteMapper;
import com.example.BookVerse.Repository.Entity.VoteSession;
import com.example.BookVerse.Service.VoteService;
import com.example.BookVerse.dto.VoteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final VoteMapper voteMapper;

    @PostMapping("/start")
    public ResponseEntity<VoteDTO.startVote> startVote(@RequestBody VoteDTO.startVote voteDTO) {
        VoteSession session = voteService.startVote(voteDTO);
        return ResponseEntity.ok(voteMapper.toStartVoteDTO(session));
    }

    @PostMapping("/add/{vote_id}/{book_id}")
    public ResponseEntity<String> addVoteOption(@PathVariable UUID book_id, @PathVariable long vote_id) {
        voteService.addBook(vote_id, book_id);
        return ResponseEntity.ok("Vote added");
    }

    @GetMapping("/{club_id}")
    public ResponseEntity<String> getVotes(@PathVariable("club_id") Long club_id) {
        return null;
    }

    @PostMapping("/{vote_id}/vote")
    public ResponseEntity<String> vote(@PathVariable("vote_id") Long vote_id) {
        return null;
    }

    @GetMapping("/{vote_id}/results")
    public ResponseEntity<String> getVoteResults(@PathVariable("vote_id") Long vote_id) {
        return null;
    }

    @PostMapping("/{vote_id}/end")
    public ResponseEntity<String> endVote(@PathVariable("vote_id") Long vote_id) {
        return null;
    }
}
