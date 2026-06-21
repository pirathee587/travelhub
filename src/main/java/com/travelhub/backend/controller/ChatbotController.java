package com.travelhub.backend.controller;

import com.travelhub.backend.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
// NO @RequestMapping prefix here — the endpoint must be exactly /chat
// because that is what ChatbotWidget.jsx calls with fetch('/chat')
public class ChatbotController {

    private final ChatbotService chatbotService;

    // Spring Boot automatically injects ChatbotService (Dependency Injection)
    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * POST /chat
     *
     * Frontend sends:  { "prompt": "user question here" }
     * We must return:  { "response": "AI answer here" }
     *
     * Field names MUST match exactly what ChatbotWidget.jsx sends and reads.
     * The widget reads: data.response
     * The widget sends: { prompt: input }
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {

        // Read the field named "prompt" — NOT "message"
        String userPrompt = request.get("prompt");

        // Validate: don't call AI with empty input
        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            // Return field named "response" — NOT "error", NOT "reply"
            return ResponseEntity.badRequest()
                    .body(Map.of("response", "Please type a question."));
        }

        // Send to Python AI service, get back the answer
        String aiAnswer = chatbotService.getAIReply(userPrompt.trim());

        // Return field named "response" — this is what data.response reads in React
        return ResponseEntity.ok(Map.of("response", aiAnswer));
    }

    /**
     * POST /sync
     * Called internally when admin creates/updates a package or hotel.
     * Tells the Python AI service to reload its data from the database.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync() {
        chatbotService.triggerDataSync();
        return ResponseEntity.ok(Map.of("status", "Sync triggered"));
    }
}