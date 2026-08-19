package com.travelhub.backend.controller;

import com.travelhub.backend.dto.ChatbotRequestDto;
import com.travelhub.backend.dto.ChatbotResponseDto;
import com.travelhub.backend.service.ChatbotClient;
import com.travelhub.backend.service.ChatbotCurrencyService;
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
    private final ChatbotCurrencyService chatbotCurrencyService;

    @PostMapping("/message")
    public ResponseEntity<ChatbotResponseDto> chat(@RequestBody ChatbotRequestDto request) {
        // Validate
        if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
            ChatbotResponseDto response = new ChatbotResponseDto();
            response.setResponse("Please type a question.");
            return ResponseEntity.badRequest().body(response);
        }

        // Get raw AI reply — pass history so the AI understands follow-up questions
        String rawReply = chatbotClient.sendMessage(request.getPrompt(), request.getHistory());

        // Determine currency preference (default to "USD" if not supplied)
        String currency = (request.getCurrency() != null && !request.getCurrency().isBlank())
                ? request.getCurrency().trim().toUpperCase()
                : "USD";

        // Post-process the reply: convert USD prices to LKR if requested
        String processedReply = chatbotCurrencyService.processForCurrency(
                request.getPrompt(), rawReply, currency
        );

        ChatbotResponseDto response = new ChatbotResponseDto();
        response.setResponse(processedReply);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync() {
        chatbotClient.triggerDataSync();
        return ResponseEntity.ok(Map.of("status", "Sync triggered"));
    }
}