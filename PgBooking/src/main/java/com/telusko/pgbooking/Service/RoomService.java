package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.Model.Property;
import com.telusko.pgbooking.Model.Room;
import com.telusko.pgbooking.Repo.PropertyRepository;
import com.telusko.pgbooking.Repo.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    public RoomService(RoomRepository roomRepository,
                       PropertyRepository propertyRepository) {

        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
    }

    public Room createRoom(Room room, Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        room.setProperty(property);

        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Long id) {

        return roomRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));
    }

    public Room updateRoom(Long id, Room updatedRoom) {

        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        existingRoom.setArea(updatedRoom.getArea());
        existingRoom.setAddress(updatedRoom.getAddress());
        existingRoom.setDescription(updatedRoom.getDescription());
        existingRoom.setSecurityDeposit(
                updatedRoom.getSecurityDeposit()
        );
        existingRoom.setFurnishing(
                updatedRoom.isFurnishing()
        );
        existingRoom.setParking(updatedRoom.getParking());
        existingRoom.setRoomType(updatedRoom.getRoomType());
        existingRoom.setFloorNumber(
                updatedRoom.getFloorNumber()
        );

        return roomRepository.save(existingRoom);
    }

    public void deleteRoom(Long id) {

        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found");
        }

        roomRepository.deleteById(id);
    }
}