package com.travelhub.backend.controller;

import com.travelhub.backend.dto.ChatbotRequestDto;
import com.travelhub.backend.dto.ChatbotResponseDto;
import com.travelhub.backend.service.ChatbotClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotClient chatbotClient;

    @PostMapping("/message")
    @PreAuthorize("hasRole('TOURIST')")
    public ResponseEntity<ChatbotResponseDto> chat(@RequestBody ChatbotRequestDto request) {
        // Validate
        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            ChatbotResponseDto response = new ChatbotResponseDto();
            response.setResponse("Please type a question.");
            return ResponseEntity.badRequest().body(response);
        }

        String reply = chatbotClient.sendMessage(request.getPrompt());
        
        ChatbotResponseDto response = new ChatbotResponseDto();
        response.setResponse(reply);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync() {
        chatbotClient.triggerDataSync();
        return ResponseEntity.ok(Map.of("status", "Sync triggered"));
    }
}