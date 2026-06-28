package com.example.BookVerse.Service;

import com.example.BookVerse.Mapper.VoteMapper;
import com.example.BookVerse.Repository.*;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.dto.VoteDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
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
    private final BookVoteRepository bookVoteRepository;
    private final ApplicationEventPublisher eventPublisher;

    public VoteSession startVote(VoteDTO.startVote voteDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User owner = userRepository.findByLogin(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        VoteSession voteSession = new VoteSession();
        voteSession.setTitle(voteDTO.name());
        voteSession.setDescription(voteDTO.description());
        voteSession.setStartDate(voteDTO.start());
        voteSession.setEndDate(voteDTO.end());

        if (voteDTO.start() != null && !voteDTO.start().isAfter(LocalDateTime.now())) {
            voteSession.setStatus(VoteStatus.ACTIVE);
        } else {
            voteSession.setStatus(VoteStatus.WAITING);
        }

        Club club = clubRepository.findByName(voteDTO.club_name())
                .orElseThrow(() -> new RuntimeException("Club not found: " + voteDTO.club_name()));

        voteSession.setClub(club);
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

    public BookVote voteBook(Long voteId, long optionId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByLogin(username).orElseThrow(() -> new RuntimeException("User Not Found"));

        VoteSession voteSession = voteSessionRepository.findById(voteId).orElseThrow(() -> new RuntimeException("Vote not found"));

        VoteOption voteOption = voteOptionRepository.findById(optionId).orElseThrow(() -> new RuntimeException("Option not found"));

        boolean alreadyVoted = bookVoteRepository
                .existsByUserAndVoteSession(user, voteSession);

        if (alreadyVoted) {
            throw new RuntimeException("User already voted");
        }

        if(voteSession.getStatus() == VoteStatus.WAITING || voteSession.getStatus() == VoteStatus.FINISHED) {
            throw new RuntimeException("Vote is not started or already finished, check time and date.");
        }

        BookVote vote = new BookVote();
        vote.setUser(user);
        vote.setVoteSession(voteSession);
        vote.setVoteOption(voteOption);
        vote.setVotedAt(LocalDateTime.now());

        bookVoteRepository.save(vote);
        return vote;
    }

    public VoteDTO.VoteResultDTO getVoteResult(Long voteId) {

        VoteSession vote = voteSessionRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        List<VoteDTO.VoteResultDTO.OptionResult> results =
                bookVoteRepository.countVotesByVoteId(voteId)
                        .stream()
                        .map(row -> new VoteDTO.VoteResultDTO.OptionResult(
                                (String) row[0],
                                ((Number) row[1]).longValue()
                        ))
                        .sorted(Comparator.comparingLong(VoteDTO.VoteResultDTO.OptionResult::score).reversed())
                        .toList();

        return new VoteDTO.VoteResultDTO(vote.getTitle(), results);
    }

    @Transactional
    public VoteDTO.VoteResultDTO finishVote(Long voteId) {

        VoteSession vote = voteSessionRepository.findById(voteId)
                .orElseThrow(() -> new RuntimeException("Vote not found"));

        if (vote.getStatus() != VoteStatus.ACTIVE) {
            throw new RuntimeException("Vote is not active");
        }

        vote.setStatus(VoteStatus.FINISHED);

        // Если нужен event - убери эту строку или исправь
        // eventPublisher.publishEvent(
        //     new VoteDTO.VoteFinishedEvent(vote.getId(), vote.getClub().getId(), null)
        // );

        voteSessionRepository.save(vote);
        return getVoteResult(voteId);
    }
}
