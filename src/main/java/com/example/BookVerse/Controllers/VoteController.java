package com.example.BookVerse.Controllers;

import com.example.BookVerse.Mapper.VoteMapper;
import com.example.BookVerse.Repository.Entity.VoteSession;
import com.example.BookVerse.Service.VoteService;
import com.example.BookVerse.dto.VoteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<List<VoteDTO.shortVoteDTO>> getVotes(@PathVariable("club_id") Long club_id) {
        return ResponseEntity.ok(voteService.getVotes(club_id));
    }

    @PostMapping("/{vote_id}/vote/{option_id}")
    public ResponseEntity<VoteDTO.votedBookDTO> vote(@PathVariable("vote_id") Long vote_id, @PathVariable Long option_id) {
        return ResponseEntity.ok(voteMapper.toVotedBookDTO(voteService.voteBook(vote_id, option_id)));
    }

    @GetMapping("/{vote_id}/results")
    public ResponseEntity<VoteDTO.VoteResultDTO> getVoteResults(@PathVariable("vote_id") Long vote_id) {
        return ResponseEntity.ok(voteService.getVoteResult(vote_id));
    }

    @PostMapping("/end/{vote_id}")
    public ResponseEntity<VoteDTO.VoteResultDTO> endVote(@PathVariable("vote_id") Long vote_id) {
        return ResponseEntity.ok(voteService.finishVote(vote_id));
    }
}
