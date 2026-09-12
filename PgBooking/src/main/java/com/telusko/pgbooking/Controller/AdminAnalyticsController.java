package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Service.AdminAnalyticsService;
import com.telusko.pgbooking.dto.AdminAnalyticsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;

    public AdminAnalyticsController(
            AdminAnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getAnalytics()
        );
    }
}