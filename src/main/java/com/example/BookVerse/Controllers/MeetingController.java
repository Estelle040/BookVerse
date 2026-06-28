package com.example.BookVerse.Controllers;

import com.example.BookVerse.Service.MeetingService;
import com.example.BookVerse.dto.MeetingDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    
    @PatchMapping("/update/{meet_id}")
    public ResponseEntity<MeetingDTO.MeetingViewDTO> updateMeeting(
            @PathVariable Long meet_id,
            @RequestBody MeetingDTO.UpdateMeetingDTO dto
    ) {
        return ResponseEntity.ok(meetingService.updateMeeting(meet_id, dto));
    }

    
    @PostMapping("/cancel/{meet_id}")
    public ResponseEntity<String> cancelMeeting(@PathVariable Long meet_id) {
        meetingService.cancelMeeting(meet_id);
        return ResponseEntity.ok("Meeting cancelled");
    }

    @GetMapping("/{club_id}/meetings")
    public ResponseEntity<List<MeetingDTO.MeetingViewDTO>> getClubMeetings(
            @PathVariable Long club_id
    ) {
        return ResponseEntity.ok(meetingService.getClubMeetings(club_id));
    }

    @GetMapping("/{meet_id}/details")
    public ResponseEntity<MeetingDTO.MeetingViewDTO> getMeetingDetails(
            @PathVariable Long meet_id
    ) {
        return ResponseEntity.ok(meetingService.getMeetingDetails(meet_id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MeetingDTO.MeetingViewDTO>> getMeetings() {
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }

    
    @PostMapping("/create/{clubId}")
    public ResponseEntity<String> createMeeting(
            @PathVariable Long clubId,
            @RequestBody @Valid MeetingDTO.CreateMeetingDTO dto,
            Authentication authentication
    ) {

        meetingService.createMeeting(
                clubId,
                dto,
                authentication.getName()
        );

        return ResponseEntity.ok("Встреча успешно создана.");
    }

    @PostMapping("/{meet_id}/attend")
    public ResponseEntity<String> attendMeeting(
            @PathVariable Long meet_id,
            @RequestParam boolean willAttend,
            Authentication authentication
    ) {
        meetingService.attendMeeting(meet_id, willAttend, authentication.getName());
        return ResponseEntity.ok(willAttend ? "Вы отметились как участник" : "Вы отметились как отсутствующий");
    }

    @GetMapping("/{meet_id}/participants")
    public ResponseEntity<List<MeetingDTO.MeetingParticipantDTO>> getParticipants(
            @PathVariable Long meet_id
    ) {
        return ResponseEntity.ok(meetingService.getParticipants(meet_id));
    }

}