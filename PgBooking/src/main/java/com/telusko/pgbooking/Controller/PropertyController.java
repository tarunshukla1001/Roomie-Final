package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Model.Property;
import com.telusko.pgbooking.Service.PropertyService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public Property createProperty(
            @RequestBody Property property,
            Authentication authentication) {

        String email = authentication.getName();

        return propertyService.createProperty(property, email);
    }

    @GetMapping
    public List<Property> getAllProperties() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/my")
    public List<Property> getMyProperties(Authentication authentication) {

        String email = authentication.getName();

        return propertyService.getMyProperties(email);
    }

    @GetMapping("/{id}")
    public Property getProperty(@PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    @PutMapping("/{id}")
    public Property updateProperty(
            @PathVariable Long id,
            @RequestBody Property property,
            Authentication authentication) {

        String email = authentication.getName();

        return propertyService.updateProperty(
                id,
                property,
                email
        );
    }

    @DeleteMapping("/{id}")
    public String deleteProperty(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();

        propertyService.deleteProperty(id, email);

        return "Property deleted successfully";
    }
}