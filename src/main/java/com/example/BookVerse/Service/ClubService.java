package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.ClubMapper;
import com.example.BookVerse.Repository.ClubMemberRepository;
import com.example.BookVerse.Repository.ClubRepository;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.Repository.UserRepository;
import com.example.BookVerse.dto.ClubDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClubService {
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubMapper clubMapper;


    public Club createClub(ClubDTO.saveClubDto saveClubDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Club club = new Club();
        club.setName(saveClubDto.name());
        club.setDescription(saveClubDto.description());
        club.setPrivate(saveClubDto.isPrivate());
        club.setOwnerUser(user);
        clubRepository.save(club);
        return club;
    }

    public void joinClub(Long clubId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Optional<ClubMember> alreadyMember = clubMemberRepository.findByUserAndClub(user, club);
        if (alreadyMember.isPresent()) {
            if(alreadyMember.get().getStatus() == MemberStatus.ACTIVE) {
                throw new RuntimeException("Already joined club");
            } else if (alreadyMember.get().getStatus() == MemberStatus.LEFT) {
                alreadyMember.get().setStatus(MemberStatus.ACTIVE);
                clubMemberRepository.save(alreadyMember.get());
            }
        }
        else {
            ClubMember clubMember = new ClubMember();
            clubMember.setUser(user);
            clubMember.setClub(club);
            clubMember.setStatus(MemberStatus.ACTIVE);
            clubMemberRepository.save(clubMember);
        }
    }

    @Transactional
    public void leaveClub(Long clubId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User usr = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        ClubMember member = clubMemberRepository.findByUserAndClub(usr, club)
                .orElseThrow(() -> new RuntimeException("You are not a member"));

        member.setStatus(MemberStatus.LEFT);
    }

    public List<ClubDTO.ListClubDto> getAllClubs() {
        return clubRepository.findAll()
                .stream()
                .map(clubMapper::toListClubDTO)
                .toList();
    }

    public List<ClubDTO.ListClubDto> getUserClubs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return clubMemberRepository
                .findByUserAndStatus(user, MemberStatus.ACTIVE)
                .stream()
                .map(ClubMember::getClub)
                .map(clubMapper::toListClubDTO)
                .toList();
    }

    @Transactional
    public void banUser(UUID userId, Long clubId) {
        User usr = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        ClubMember member = clubMemberRepository.findByUserAndClub(usr, club)
                .orElseThrow(() -> new RuntimeException("You are not a member"));

        member.setStatus(MemberStatus.BANNED);
    }

    @Transactional
    public void unbanUser(UUID userId, Long clubId) {
        User usr = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        ClubMember member = clubMemberRepository.findByUserAndClub(usr, club)
                .orElseThrow(() -> new RuntimeException("You are not a member"));

        member.setStatus(MemberStatus.ACTIVE);
    }

    public List<ClubDTO.clubMember> getClubMembers(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        return club.getMembers().stream()
                .map(m -> new ClubDTO.clubMember(
                        m.getUser().getLogin(),
                        m.getStatus()
                ))
                .toList();
    }

}
