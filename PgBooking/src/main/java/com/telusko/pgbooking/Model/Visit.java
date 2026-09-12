package com.telusko.pgbooking.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Registered user, if logged in
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Anonymous browser identifier
    private String visitorId;

    // Page visited
    private String page;

    // Exact date and time
    private LocalDateTime visitedAt;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public String getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(String visitorId) {
        this.visitorId = visitorId;
    }


    public String getPage() {
        return page;
    }

    public void setPage(String page) {
        this.page = page;
    }


    public LocalDateTime getVisitedAt() {
        return visitedAt;
    }

    public void setVisitedAt(LocalDateTime visitedAt) {
        this.visitedAt = visitedAt;
    }
}