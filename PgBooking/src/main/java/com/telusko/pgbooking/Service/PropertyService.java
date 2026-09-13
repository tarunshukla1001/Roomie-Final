package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.Model.Property;
import com.telusko.pgbooking.Model.Room;
import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Repo.PropertyRepository;
import com.telusko.pgbooking.Repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final RoomService roomService;

    public PropertyService(
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            RoomService roomService) {

        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.roomService = roomService;
    }

    public Property createProperty(Property property, String email) {

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        property.setOwner(owner);

        Property savedProperty = propertyRepository.save(property);

        Room defaultRoom = new Room();
        defaultRoom.setProperty(savedProperty);
        defaultRoom.setAddress(savedProperty.getAddress() != null ? savedProperty.getAddress() : "");
        defaultRoom.setDescription(savedProperty.getDescription() != null ? savedProperty.getDescription() : "");
        defaultRoom.setRoomType("Shared PG");
        defaultRoom.setArea(180);
        defaultRoom.setSecurityDeposit(savedProperty.getMonthlyRent() != null ? savedProperty.getMonthlyRent().intValue() : 0);
        defaultRoom.setFurnishing(true);
        defaultRoom.setParking(1);
        defaultRoom.setFloorNumber(1);

        roomService.createRoom(defaultRoom, savedProperty.getId());

        return savedProperty;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public Property updateProperty(
            Long id,
            Property updatedProperty,
            String email) {

        Property existingProperty =
                propertyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Property not found"));

        if (existingProperty.getOwner() == null ||
                !existingProperty.getOwner()
                        .getEmail()
                        .equalsIgnoreCase(email)) {

            throw new RuntimeException(
                    "You are not allowed to update this property"
            );
        }

        existingProperty.setName(updatedProperty.getName());
        existingProperty.setDescription(updatedProperty.getDescription());
        existingProperty.setAddress(updatedProperty.getAddress());
        existingProperty.setCity(updatedProperty.getCity());
        existingProperty.setMonthlyRent(
                updatedProperty.getMonthlyRent()
        );

        return propertyRepository.save(existingProperty);
    }


    public void deleteProperty(Long id, String email) {

        Property property =
                propertyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Property not found"));

        if (property.getOwner() == null ||
                !property.getOwner()
                        .getEmail()
                        .equalsIgnoreCase(email)) {

            throw new RuntimeException(
                    "You are not allowed to delete this property"
            );
        }

        propertyRepository.delete(property);
    }
    public List<Property> getMyProperties(String email) {
        return propertyRepository.findByOwner_EmailIgnoreCase(email);
    }
}