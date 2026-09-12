package com.telusko.pgbooking.Repo;

import com.telusko.pgbooking.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status <> 'CANCELLED'
        AND b.startdate < :enddate
        AND b.enddate > :startdate
        """)
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("startdate") LocalDate startdate,
            @Param("enddate") LocalDate enddate
    );

    java.util.List<Booking> findByRoomIdAndStatusNot(Long roomId, String status);
}