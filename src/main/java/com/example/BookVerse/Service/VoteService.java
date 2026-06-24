package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.VoteMapper;
import com.example.BookVerse.Repository.*;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.dto.VoteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteSessionRepository voteSessionRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final BookRepository bookRepository;
    private final VoteOptionRepository voteOptionRepository;
    private final VoteMapper voteMapper;

    public VoteSession startVote(VoteDTO.startVote voteDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User owner = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        VoteSession voteSession = new VoteSession();
        voteSession.setTitle(voteDTO.name());
        if (Objects.equals(voteDTO.start(), LocalDateTime.now())){
            voteSession.setStatus(VoteStatus.ACTIVE);
        }
        else {
            voteSession.setStatus(VoteStatus.WAITING);
        }
        voteSession.setStartDate(voteDTO.start());
        voteSession.setEndDate(voteDTO.end());

        Club club = clubRepository.findByOwnerUserAndName(owner, voteDTO.name())
                .orElseThrow(() -> new RuntimeException("Club Not Found"));

        voteSession.setClub(club);
        voteSession.setDescription(voteDTO.description());
        voteSession.setCreator(owner);

        voteSessionRepository.save(voteSession);
        return voteSession;
    }

    @Transactional
    public void addBook(Long voteId, UUID bookId) {

        VoteSession vote = voteSessionRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        VoteOption option = new VoteOption();
        option.setVoteSession(vote);
        option.setBook(book);

        voteOptionRepository.save(option);
    }

    public List<VoteDTO.shortVoteDTO> getVotes(Long clubId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        return voteSessionRepository.findVoteSessionByClub(club)
                .stream()
                .map(voteMapper::toShortVoteDTO)
                .toList();
    }



}
