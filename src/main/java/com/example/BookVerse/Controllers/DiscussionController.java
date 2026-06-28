package com.example.BookVerse.Controllers;

import com.example.BookVerse.Service.DiscussionService;
import com.example.BookVerse.dto.DiscussionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;


    @PostMapping("/create")
    public ResponseEntity<DiscussionDTO.ThreadResponseDTO> create(@RequestBody DiscussionDTO.CreateThreadDTO dto) {
        return ResponseEntity.ok(discussionService.createThread(dto));
    }


    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<DiscussionDTO.ThreadResponseDTO>> getClubThreads(@PathVariable Long clubId) {
        return ResponseEntity.ok(discussionService.getClubThreads(clubId));
    }

    @PostMapping("/message")
    public ResponseEntity<String> sendMessage(@RequestBody DiscussionDTO.MessageDTO dto) {
        discussionService.sendMessage(dto);
        return ResponseEntity.ok("Message sent");
    }

    @GetMapping("/{threadId}/messages")
    public ResponseEntity<List<DiscussionDTO.MessageResponseDTO>> getMessages(@PathVariable Long threadId) {
        return ResponseEntity.ok(discussionService.getMessages(threadId));
    }
}