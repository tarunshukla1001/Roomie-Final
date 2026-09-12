package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.Repo.VisitRepository;
import com.telusko.pgbooking.dto.AdminAnalyticsResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminAnalyticsService {

    private final VisitRepository visitRepository;

    public AdminAnalyticsService(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }

    public AdminAnalyticsResponse getAnalytics() {

        long totalVisits =
                visitRepository.count();

        long uniqueVisitors =
                visitRepository.countUniqueVisitors();

        long loggedInVisits =
                visitRepository.countLoggedInVisits();

        long anonymousVisits =
                visitRepository.countAnonymousVisits();

        LocalDateTime startOfToday =
                LocalDate.now().atStartOfDay();

        long visitsToday =
                visitRepository.countByVisitedAtAfter(startOfToday);

        // Last 30 days
        LocalDateTime startDate =
                LocalDate.now()
                        .minusDays(29)
                        .atStartOfDay();

        List<AdminAnalyticsResponse.DailyVisit> dailyVisits =
                visitRepository.findDailyVisits(startDate)
                        .stream()
                        .map(row -> {

                            String date = row[0].toString();

                            long visits =
                                    ((Number) row[1]).longValue();

                            return new AdminAnalyticsResponse.DailyVisit(
                                    date,
                                    visits
                            );
                        })
                        .toList();

        List<AdminAnalyticsResponse.PageVisit> popularPages =
                visitRepository.findMostVisitedPages()
                        .stream()
                        .map(row ->
                                new AdminAnalyticsResponse.PageVisit(
                                        (String) row[0],
                                        ((Number) row[1]).longValue()
                                )
                        )
                        .toList();

        return new AdminAnalyticsResponse(
                totalVisits,
                uniqueVisitors,
                loggedInVisits,
                anonymousVisits,
                visitsToday,
                dailyVisits,
                popularPages
        );
    }
}