package com.telusko.pgbooking.Controller;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/Gemini")
@CrossOrigin(origins = "*")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    private static final String SYSTEM_PROMPT = """
        You are RoomieAI, the official AI assistant for Roomie (roomie.stay), a PG and room booking platform.
        You help users find affordable PGs, shared rooms, and student accommodations.
        You know about the following features of Roomie:
        - Users can browse properties, stays, and rooms with photos, prices, and amenities
        - Users can view room details including rent, deposit, furnishing, parking, and room type
        - Users can book rooms for specific date ranges and view booking history
        - Users can register, login, and manage their profiles
        - Roomie serves students and professionals looking for budget-friendly accommodation
        - The platform displays monthly rent prices in Indian Rupees (INR)
        - Common room types include Shared PG, Single Room, and Hostel rooms
        - Properties are located in various Indian cities

        When answering questions:
        - Be friendly, concise, and helpful
        - If asked about prices, always mention that prices are monthly rent in INR
        - If you don't know a specific detail, suggest the user browse the platform or contact hello@roomie.stay
        - Never make up specific property details you don't have access to
        - Keep responses under 200 words
        - Use a casual but professional tone
        - Reference Roomie features naturally when relevant
        """;

    @Value("${google.genai.api-key}")
    private String apiKey;

    @GetMapping("/{message}")
    public ResponseEntity<String> getAnswer(@PathVariable String message) {
        try {
            log.info("Received AI request: {}", message);

            if (apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_GOOGLE_GENAI_API_KEY")) {
                log.warn("Google GenAI API key is not configured");
                return ResponseEntity.status(503).body("AI service not configured. Please set the API key.");
            }

            Part systemPart = Part.fromText(SYSTEM_PROMPT);
            Content systemContent = Content.fromParts(systemPart);

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(systemContent)
                    .httpOptions(HttpOptions.builder()
                            .timeout(60000)
                            .build())
                    .build();

            Client client = Client.builder()
                    .apiKey(apiKey)
                    .build();

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-3.6-flash",
                    message,
                    config
            );

            log.info("AI response received: {}", response.text());
            return ResponseEntity.ok(response.text());
        } catch (Exception e) {
            log.error("Error generating AI response", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
