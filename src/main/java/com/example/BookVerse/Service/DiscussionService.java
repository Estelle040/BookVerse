package com.example.BookVerse.Service;

import com.example.BookVerse.Repository.*;
import com.example.BookVerse.Repository.Entity.*;
import com.example.BookVerse.dto.DiscussionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionService {

    private final DiscussionThreadRepository threadRepository;
    private final DiscussionMessageRepository messageRepository;
    private final ClubRepository clubRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public DiscussionDTO.ThreadResponseDTO createThread(DiscussionDTO.CreateThreadDTO dto) {

        Club club = clubRepository.findById(dto.clubId())
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Book book = bookRepository.findById(dto.bookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        DiscussionThread thread = new DiscussionThread();
        thread.setClub(club);
        thread.setBook(book);
        thread.setTitle(dto.title());

        threadRepository.save(thread);

        return new DiscussionDTO.ThreadResponseDTO(
                thread.getId(),
                thread.getTitle(),
                book.getTitle(),
                thread.getCreatedAt()
        );
    }


    public List<DiscussionDTO.ThreadResponseDTO> getClubThreads(Long clubId) {

        return threadRepository.findByClubId(clubId)
                .stream()
                .map(t -> new DiscussionDTO.ThreadResponseDTO(
                        t.getId(),
                        t.getTitle(),
                        t.getBook().getTitle(),
                        t.getCreatedAt()
                ))
                .toList();
    }


    public void sendMessage(DiscussionDTO.MessageDTO dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = userRepository.findByLogin(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        DiscussionThread thread = threadRepository.findById(dto.threadId())
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        DiscussionMessage msg = new DiscussionMessage();
        msg.setThread(thread);
        msg.setUser(user);
        msg.setMessage(dto.message());

        messageRepository.save(msg);
    }

    public List<DiscussionDTO.MessageResponseDTO> getMessages(Long threadId) {

        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId)
                .stream()
                .map(m -> new DiscussionDTO.MessageResponseDTO(
                        m.getUser().getLogin(),
                        m.getMessage(),
                        m.getCreatedAt()
                ))
                .toList();
    }
}