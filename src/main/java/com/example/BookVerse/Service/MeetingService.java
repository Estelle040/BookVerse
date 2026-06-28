package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.ClubMapper;
import com.example.BookVerse.Mapper.MeetingMapper;
import com.example.BookVerse.Repository.ClubRepository;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.Repository.MeetingParticipantRepository;
import com.example.BookVerse.Repository.MeetingRepository;
import com.example.BookVerse.Repository.UserRepository;
import com.example.BookVerse.dto.MeetingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ClubRepository clubRepository;
    private final MeetingMapper meetingMapper;
    private final UserRepository userRepository;
    private final ClubMapper clubMapper;
    private final MeetingParticipantRepository meetingParticipantRepository;

    @Transactional
    public MeetingDTO.MeetingViewDTO updateMeeting(Long meetId, MeetingDTO.UpdateMeetingDTO dto) {

        Meeting meeting = meetingRepository.findById(meetId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (dto.title() != null) meeting.setTitle(dto.title());
        if (dto.description() != null) meeting.setDescription(dto.description());
        if (dto.location() != null) meeting.setLocation(dto.location());
        if (dto.meetingTime() != null) meeting.setMeeting_time(dto.meetingTime());

        return meetingMapper.toView(meeting);
    }

    @Transactional
    public void cancelMeeting(Long meetId) {

        Meeting meeting = meetingRepository.findById(meetId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setStatus(MeetingStatus.CANCELLED);
    }

    public List<MeetingDTO.MeetingViewDTO> getClubMeetings(Long clubId) {

        return meetingRepository.findByClubId(clubId)
                .stream()
                .map(meetingMapper::toView)
                .toList();
    }

    public MeetingDTO.MeetingViewDTO getMeetingDetails(Long meetId) {

        Meeting meeting = meetingRepository.findById(meetId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        return meetingMapper.toView(meeting);
    }

    public List<MeetingDTO.MeetingViewDTO> getAllMeetings() {

        return meetingRepository.findAll()
                .stream()
                .map(meetingMapper::toView)
                .toList();
    }

    public void createMeeting(Long clubId,
                              MeetingDTO.CreateMeetingDTO dto,
                              String login) {

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Клуб не найден"));

        User creator = userRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Meeting meeting = new Meeting();

        meeting.setTitle(dto.title());
        meeting.setDescription(dto.description());
        meeting.setLocation(dto.place());
        meeting.setMeeting_time(dto.meetingDate());

        meeting.setStatus(MeetingStatus.PLANNED);

        meeting.setClub(club);

        meetingRepository.save(meeting);
    }

    @Transactional
    public void attendMeeting(Long meetId, boolean willAttend, String username) {
        Meeting meeting = meetingRepository.findById(meetId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MeetingParticipant participant = meetingParticipantRepository
                .findByMeetingAndUser(meeting, user)
                .orElse(new MeetingParticipant());

        participant.setMeeting(meeting);
        participant.setUser(user);
        participant.setWillAttend(willAttend);

        meetingParticipantRepository.save(participant);
    }

    public List<MeetingDTO.MeetingParticipantDTO> getParticipants(Long meetId) {
        Meeting meeting = meetingRepository.findById(meetId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        return meetingParticipantRepository.findByMeeting(meeting)
                .stream()
                .map(p -> new MeetingDTO.MeetingParticipantDTO(
                        p.getUser().getLogin(),
                        p.isWillAttend()
                ))
                .toList();
    }
}