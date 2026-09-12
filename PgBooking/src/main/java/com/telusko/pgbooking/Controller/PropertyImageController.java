package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Model.Property;
import com.telusko.pgbooking.Model.PropertyImage;
import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Repo.PropertyImageRepository;
import com.telusko.pgbooking.Repo.PropertyRepository;
import com.telusko.pgbooking.Repo.UserRepository;
import com.telusko.pgbooking.Service.CloudinaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyImageController {

    private final CloudinaryService cloudinaryService;
    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository propertyImageRepository;
    private final UserRepository userRepository;

    public PropertyImageController(
            CloudinaryService cloudinaryService,
            PropertyRepository propertyRepository,
            PropertyImageRepository propertyImageRepository,
            UserRepository userRepository) {

        this.cloudinaryService = cloudinaryService;
        this.propertyRepository = propertyRepository;
        this.propertyImageRepository = propertyImageRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // UPLOAD IMAGE
    // =========================

    @PostMapping("/{propertyId}/images")
    public ResponseEntity<PropertyImage> uploadImage(
            @PathVariable Long propertyId,
            @RequestParam("image") MultipartFile image,
            Authentication authentication)
            throws Exception {

        Property property = propertyRepository
                .findById(propertyId)
                .orElseThrow(() ->
                        new RuntimeException("Property not found"));

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // OWNER can only upload to their own property
        if (user.getRole().name().equals("OWNER")) {

            if (property.getOwner() == null ||
                    !property.getOwner().getId().equals(user.getId())) {

                return ResponseEntity
                        .status(403)
                        .build();
            }
        }

        // Upload to Cloudinary
        Map result =
                cloudinaryService.uploadImage(image);

        String imageUrl =
                result.get("secure_url").toString();

        String publicId =
                result.get("public_id").toString();

        // Create database record
        PropertyImage propertyImage =
                new PropertyImage();

        propertyImage.setImageUrl(imageUrl);
        propertyImage.setPublicId(publicId);
        propertyImage.setProperty(property);

        PropertyImage saved =
                propertyImageRepository.save(propertyImage);

        return ResponseEntity.ok(saved);
    }


    // =========================
    // GET PROPERTY IMAGES
    // =========================

    @GetMapping("/{propertyId}/images")
    public ResponseEntity<?> getPropertyImages(
            @PathVariable Long propertyId) {

        if (!propertyRepository.existsById(propertyId)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        List<PropertyImage> images =
                propertyImageRepository
                        .findByPropertyId(propertyId);

        return ResponseEntity.ok(images);
    }


    // =========================
    // DELETE IMAGE
    // =========================

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<String> deleteImage(
            @PathVariable Long imageId,
            Authentication authentication)
            throws Exception {

        PropertyImage propertyImage =
                propertyImageRepository
                        .findById(imageId)
                        .orElseThrow(() ->
                                new RuntimeException("Image not found"));

        Property property =
                propertyImage.getProperty();

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // ADMIN can delete any image
        if (!user.getRole().name().equals("ADMIN")) {

            // Must be OWNER
            if (!user.getRole().name().equals("OWNER")) {

                return ResponseEntity
                        .status(403)
                        .body("You are not allowed to delete this image");
            }

            // Property must belong to this OWNER
            if (property.getOwner() == null ||
                    !property.getOwner().getId().equals(user.getId())) {

                return ResponseEntity
                        .status(403)
                        .body("You can only delete images from your own property");
            }
        }

        // Delete from Cloudinary
        cloudinaryService.deleteImage(
                propertyImage.getPublicId()
        );

        // Delete from MySQL
        propertyImageRepository.delete(propertyImage);

        return ResponseEntity.ok(
                "Image deleted successfully"
        );
    }
}