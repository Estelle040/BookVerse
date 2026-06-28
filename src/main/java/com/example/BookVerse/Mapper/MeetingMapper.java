package com.example.BookVerse.Mapper;

import com.example.BookVerse.Repository.Entity.Meeting;
import com.example.BookVerse.dto.MeetingDTO;
import org.springframework.stereotype.Component;

@Component
public class MeetingMapper {

    public MeetingDTO.MeetingViewDTO toView(Meeting meeting) {
        return new MeetingDTO.MeetingViewDTO(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getDescription(),
                meeting.getLocation(),
                meeting.getMeeting_time(),
                meeting.getStatus().name()
        );
    }
}