package com.example.BookVerse.dto;

import java.time.LocalDateTime;

public class MeetingDTO {

    public record MeetingViewDTO(
            Long id,
            String title,
            String description,
            String location,
            LocalDateTime meetingTime,
            String status
    ) {}

    public record UpdateMeetingDTO(
            String title,
            String description,
            String location,
            LocalDateTime meetingTime
    ) {}

    public record CreateMeetingDTO(

            String title,

            String description,

            String place,

            LocalDateTime meetingDate,

            Integer expectedDurationMinutes,

            Boolean online,

            String meetingLink

    ) {}

    public record MeetingParticipantDTO(
            String login,
            boolean willAttend
    ) {}
}