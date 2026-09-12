 package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Model.Visit;
import com.telusko.pgbooking.Repo.UserRepository;
import com.telusko.pgbooking.Repo.VisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VisitService {

    private final VisitRepository visitRepository;
    private final UserRepository userRepository;

    public VisitService(
            VisitRepository visitRepository,
            UserRepository userRepository) {

        this.visitRepository = visitRepository;
        this.userRepository = userRepository;
    }

    public Visit trackVisit(
            String visitorId,
            String page,
            String email) {

        Visit visit = new Visit();

        // Anonymous browser identifier
        visit.setVisitorId(visitorId);

        // Page visited
        visit.setPage(page);

        // Exact time
        visit.setVisitedAt(LocalDateTime.now());

        // If logged in, identify the user from
        // Spring Security's authenticated JWT.
        if (email != null) {

            User user = userRepository.findByEmail(email)
                    .orElse(null);

            visit.setUser(user);
        }

        return visitRepository.save(visit);
    }
}

