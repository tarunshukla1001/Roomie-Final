package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.dto.BookingRequest;
import com.telusko.pgbooking.Model.Booking;
import com.telusko.pgbooking.Model.Property;
import com.telusko.pgbooking.Model.Room;
import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Repo.BookingRepository;
import com.telusko.pgbooking.Repo.PropertyRepository;
import com.telusko.pgbooking.Repo.RoomRepository;
import com.telusko.pgbooking.Repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            RoomRepository roomRepository,
            PropertyRepository propertyRepository) {

        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
    }

    public Booking createBooking(BookingRequest request, String userEmail) {

        // Find the user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find the room, or create a default one if missing
        Room room = roomRepository.findById(request.getRoomId())
                .orElseGet(() -> {
                    Property property = propertyRepository.findById(request.getRoomId())
                            .orElseThrow(() -> new RuntimeException("Room not found"));

                    Room defaultRoom = new Room();
                    defaultRoom.setProperty(property);
                    defaultRoom.setAddress(property.getAddress() != null ? property.getAddress() : "");
                    defaultRoom.setDescription(property.getDescription() != null ? property.getDescription() : "");
                    defaultRoom.setRoomType("Shared PG");
                    defaultRoom.setArea(180);
                    defaultRoom.setSecurityDeposit(property.getMonthlyRent() != null ? property.getMonthlyRent().intValue() : 0);
                    defaultRoom.setFurnishing(true);
                    defaultRoom.setParking(1);
                    defaultRoom.setFloorNumber(1);

                    return roomRepository.save(defaultRoom);
                });

        // Check date validity
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException(
                    "End date must be after start date");
        }

        // Check whether room is already booked
        boolean alreadyBooked =
                bookingRepository.existsOverlappingBooking(
                        request.getRoomId(),
                        request.getStartDate(),
                        request.getEndDate()
                );

        if (alreadyBooked) {
            throw new RuntimeException(
                    "Room is already booked for these dates");
        }

        // Create Booking object
        Booking booking = new Booking();

        booking.setStartdate(request.getStartDate());
        booking.setEnddate(request.getEndDate());

        booking.setUser(user);
        booking.setRoom(room);

        booking.setStatus("PENDING");

        // Save booking
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForRoom(Long roomId, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return bookingRepository.findByRoomIdAndStatusNot(roomId, "CANCELLED");
    }
}