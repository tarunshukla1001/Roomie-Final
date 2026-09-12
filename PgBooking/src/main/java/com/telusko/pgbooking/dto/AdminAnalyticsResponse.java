package com.telusko.pgbooking.dto;

import java.util.List;

public class AdminAnalyticsResponse {

    private long totalVisits;
    private long uniqueVisitors;
    private long loggedInVisits;
    private long anonymousVisits;
    private long visitsToday;

    private List<DailyVisit> dailyVisits;
    private List<PageVisit> popularPages;

    public AdminAnalyticsResponse(
            long totalVisits,
            long uniqueVisitors,
            long loggedInVisits,
            long anonymousVisits,
            long visitsToday,
            List<DailyVisit> dailyVisits,
            List<PageVisit> popularPages) {

        this.totalVisits = totalVisits;
        this.uniqueVisitors = uniqueVisitors;
        this.loggedInVisits = loggedInVisits;
        this.anonymousVisits = anonymousVisits;
        this.visitsToday = visitsToday;
        this.dailyVisits = dailyVisits;
        this.popularPages = popularPages;
    }

    public long getTotalVisits() {
        return totalVisits;
    }

    public long getUniqueVisitors() {
        return uniqueVisitors;
    }

    public long getLoggedInVisits() {
        return loggedInVisits;
    }

    public long getAnonymousVisits() {
        return anonymousVisits;
    }

    public long getVisitsToday() {
        return visitsToday;
    }

    public List<DailyVisit> getDailyVisits() {
        return dailyVisits;
    }

    public List<PageVisit> getPopularPages() {
        return popularPages;
    }

    public static class DailyVisit {

        private String date;
        private long visits;

        public DailyVisit(String date, long visits) {
            this.date = date;
            this.visits = visits;
        }

        public String getDate() {
            return date;
        }

        public long getVisits() {
            return visits;
        }
    }

    public static class PageVisit {

        private String page;
        private long visits;

        public PageVisit(String page, long visits) {
            this.page = page;
            this.visits = visits;
        }

        public String getPage() {
            return page;
        }

        public long getVisits() {
            return visits;
        }
    }
}