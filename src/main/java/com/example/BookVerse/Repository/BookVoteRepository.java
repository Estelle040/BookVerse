package com.example.BookVerse.Repository;

import com.example.BookVerse.Repository.Entity.BookVote;
import com.example.BookVerse.Repository.Entity.User;
import com.example.BookVerse.Repository.Entity.VoteSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookVoteRepository extends JpaRepository<BookVote, Long> {
    boolean existsByUserAndVoteSession(User user, VoteSession voteSession);

    @Query("""
        SELECT bv.voteOption.book.title, COUNT(bv)
        FROM BookVote bv
        WHERE bv.voteOption.voteSession.id = :voteId
        GROUP BY bv.voteOption.book.title
        ORDER BY COUNT(bv) DESC
    """)
    List<Object[]> countVotesByVoteId(@Param("voteId") Long voteId);
}
