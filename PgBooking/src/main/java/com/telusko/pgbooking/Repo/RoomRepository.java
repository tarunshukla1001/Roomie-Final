package com.telusko.pgbooking.Repo;

import com.telusko.pgbooking.Model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface RoomRepository extends JpaRepository<Room,Long> {

}
