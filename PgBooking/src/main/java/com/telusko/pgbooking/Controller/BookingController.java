package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Model.Booking;
import com.telusko.pgbooking.Service.BookingService;
import com.telusko.pgbooking.dto.BookingRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return bookingService.createBooking(
                request,
                email
        );
    }

    @GetMapping("/room/{roomId}")
    public List<Booking> getBookingsForRoom(
            @PathVariable Long roomId,
            Authentication authentication) {

        String email = authentication.getName();

        return bookingService.getBookingsForRoom(roomId, email);
    }
}