 package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Model.Visit;
import com.telusko.pgbooking.Service.VisitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    private final VisitService visitService;

    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @PostMapping
    public ResponseEntity<Visit> trackVisit(
            @RequestParam String visitorId,
            @RequestParam String page,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = null;

        // If the visitor is logged in, Spring Security
        // gives us the authenticated user's email.
        if (userDetails != null) {
            email = userDetails.getUsername();
        }

        Visit visit = visitService.trackVisit(
                visitorId,
                page,
                email
        );

        return ResponseEntity.ok(visit);
    }
}

