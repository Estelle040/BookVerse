package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.BookMapper;
import com.example.BookVerse.Mapper.ClubMapper;
import com.example.BookVerse.Repository.BookRepository;
import com.example.BookVerse.Repository.ClubMemberRepository;
import com.example.BookVerse.Repository.ClubRepository;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.Repository.UserRepository;
import com.example.BookVerse.dto.BookDTO;
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
    private final BookMapper bookMapper;
    private final BookRepository bookRepository;


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

    @Transactional
    public void joinClub(Long clubId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        // Проверяем, есть ли уже активное членство
        Optional<ClubMember> existingMembership = clubMemberRepository
                .findByClubAndUser(club, user);

        if (existingMembership.isPresent()) {
            ClubMember member = existingMembership.get();
            if (member.getStatus() == MemberStatus.ACTIVE) {
                throw new RuntimeException("Вы уже состоите в этом клубе");
            } else {
                member.setStatus(MemberStatus.ACTIVE);
                clubMemberRepository.save(member);
                return;
            }
        }

        // Новое членство
        ClubMember member = new ClubMember();
        member.setClub(club);
        member.setUser(user);
        member.setStatus(MemberStatus.ACTIVE);

        clubMemberRepository.save(member);
    }

    @Transactional
    public void leaveClub(Long clubId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        ClubMember member = clubMemberRepository
                .findByClubAndUser(club, user)
                .orElseThrow(() -> new RuntimeException("Вы не состоите в этом клубе"));

        member.setStatus(MemberStatus.LEFT);
        clubMemberRepository.save(member);
    }

    public List<ClubDTO.ListClubDto> getAllClubs() {
        return clubRepository.findAll()
                .stream()
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

    public List<BookDTO.ListBookDTO> getClubBooks(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        return club.getBooks().stream()
                .map(bookMapper::toDto)
                .toList();
    }

    @Transactional
    public void addBookToClub(Long clubId, UUID bookId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        club.getBooks().add(book);
        clubRepository.save(club);
    }

    @Transactional
    public void removeBookFromClub(Long clubId, UUID bookId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));
        club.getBooks().removeIf(book -> book.getId().equals(bookId));
        clubRepository.save(club);
    }

    public ClubDTO.ListClubDto updateClub(Long clubId, ClubDTO.saveClubDto clubDTO) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        club.setName(clubDTO.name());
        club.setDescription(clubDTO.description());
        club.setPrivate(clubDTO.isPrivate());

        club = clubRepository.save(club);
        return clubMapper.toListClubDTO(club);
    }

    public List<ClubDTO.ListClubDto> getUserClubs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Получаем клубы, где пользователь является участником
        List<ClubMember> memberships = clubMemberRepository.findByUser(user);

        return memberships.stream()
                .filter(m -> m.getStatus() == MemberStatus.ACTIVE)
                .map(ClubMember::getClub)
                .map(clubMapper::toListClubDTO)
                .toList();
    }

}
