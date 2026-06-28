package com.example.BookVerse.Service;

import com.example.BookVerse.Repository.*;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.dto.ProgressDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ReadingProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final BookRepository bookRepository;

    public ProgressDTO.ProgressViewDTO getClubBookProgress(Long clubId, UUID bookId) {

        ReadingProgress progress = progressRepository.findByClubIdAndBookId(clubId, bookId)
                .orElseThrow(() -> new RuntimeException("Progress not found"));

        return toDto(progress);
    }

    public List<ProgressDTO.ProgressViewDTO> getMyProgress() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return progressRepository.findByUser(user)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private ProgressDTO.ProgressViewDTO toDto(ReadingProgress p) {
        return new ProgressDTO.ProgressViewDTO(
                p.getId(),
                p.getUser().getLogin(),
                p.getBook().getTitle(),
                p.getClub().getId(),
                p.getCurrent_page(),
                p.getUpdated_at()
        );
    }

    @Transactional
    public void updateProgress(ProgressDTO.UpdateProgressDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ReadingProgress progress = progressRepository
                .findByClubIdAndBookId(dto.clubId(), dto.bookId())
                .orElse(null);

        if (progress == null) {
            progress = new ReadingProgress();
            progress.setUser(user);
            progress.setClub(clubRepository.getReferenceById(Math.toIntExact(dto.clubId())));
            progress.setBook(bookRepository.getReferenceById(dto.bookId()));
            progress.setCurrent_page(dto.currentPage());
        } else {
            progress.setCurrent_page(dto.currentPage());
        }

        progress.setUpdated_at(LocalDateTime.now());

        progressRepository.save(progress);
    }
}