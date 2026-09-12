package com.telusko.pgbooking.Repo;

import com.telusko.pgbooking.Model.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    @Query("""
        SELECT COUNT(DISTINCT v.visitorId)
        FROM Visit v
        """)
    long countUniqueVisitors();

    @Query("""
        SELECT COUNT(v)
        FROM Visit v
        WHERE v.user IS NOT NULL
        """)
    long countLoggedInVisits();

    @Query("""
        SELECT COUNT(v)
        FROM Visit v
        WHERE v.user IS NULL
        """)
    long countAnonymousVisits();

    @Query("""
        SELECT v.page, COUNT(v)
        FROM Visit v
        GROUP BY v.page
        ORDER BY COUNT(v) DESC
        """)
    List<Object[]> findMostVisitedPages();

    long countByVisitedAtAfter(LocalDateTime time);

    @Query("""
        SELECT
            FUNCTION('DATE', v.visitedAt),
            COUNT(v)
        FROM Visit v
        WHERE v.visitedAt >= :startDate
        GROUP BY FUNCTION('DATE', v.visitedAt)
        ORDER BY FUNCTION('DATE', v.visitedAt)
        """)
    List<Object[]> findDailyVisits(LocalDateTime startDate);
}