package com.telusko.pgbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class RoomRequest {

    @Positive(message = "Area must be greater than 0")
    private int area;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Description is required")
    private String description;

    @PositiveOrZero(message = "Security deposit cannot be negative")
    private int securityDeposit;

    private boolean furnishing;

    @PositiveOrZero(message = "Parking cannot be negative")
    private int parking;

    @NotBlank(message = "Room type is required")
    private String roomType;

    @PositiveOrZero(message = "Floor number cannot be negative")
    private int floorNumber;


    // getters and setters

    public int getArea() {
        return area;
    }

    public void setArea(int area) {
        this.area = area;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(int securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public boolean isFurnishing() {
        return furnishing;
    }

    public void setFurnishing(boolean furnishing) {
        this.furnishing = furnishing;
    }

    public int getParking() {
        return parking;
    }

    public void setParking(int parking) {
        this.parking = parking;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public int getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(int floorNumber) {
        this.floorNumber = floorNumber;
    }
}