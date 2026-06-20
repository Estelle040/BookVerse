package com.example.BookVerse.Controllers;

import com.example.BookVerse.Mapper.ClubMapper;
import com.example.BookVerse.Repository.Entity.Club;
import com.example.BookVerse.Service.ClubService;
import com.example.BookVerse.dto.ClubDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {
    private final ClubService clubService;
    private final ClubMapper clubMapper;

    @PostMapping("/create")
    public ResponseEntity<ClubDTO.saveClubDto> addClub(@RequestBody ClubDTO.saveClubDto clubDTO) {
        Club newClub = clubService.createClub(clubDTO);
        return ResponseEntity.ok(clubMapper.toClubDTO(newClub));
    }

    @PostMapping("/join/{club_id}")
    public ResponseEntity<String> joinClub(@PathVariable("club_id") Long club_id) {
        clubService.joinClub(club_id);
        return ResponseEntity.ok("Club joined successfully!");
    }

    @PostMapping("/left/{club_id}")
    public ResponseEntity<String> leftClub(@PathVariable("club_id") Long club_id) {
        clubService.leaveClub(club_id);
        return ResponseEntity.ok("Club left successfully!");
    }

    @GetMapping("/all")
    public ResponseEntity<List<ClubDTO.ListClubDto>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/user-clubs")
    public ResponseEntity<List<ClubDTO.ListClubDto>> getUserClubs() {
        return ResponseEntity.ok(clubService.getUserClubs());
    }

    @PostMapping("{club_id}/ban/{user_id}")
    public ResponseEntity<String> banUser(@PathVariable Long club_id, @PathVariable UUID user_id) {
        clubService.banUser(user_id, club_id);
        return ResponseEntity.ok("User banned successfully!");
    }

    @PostMapping("{club_id}/unban/{user_id}")
    public ResponseEntity<String> unbanUser(@PathVariable Long club_id, @PathVariable UUID user_id) {
        clubService.unbanUser(user_id, club_id);
        return ResponseEntity.ok("User unbanned successfully!");
    }

    @GetMapping("{club_id}/members")
    public ResponseEntity<List<ClubDTO.clubMember>> getMembers(@PathVariable Long club_id) {
        return ResponseEntity.ok(clubService.getClubMembers(club_id));
    }

}
