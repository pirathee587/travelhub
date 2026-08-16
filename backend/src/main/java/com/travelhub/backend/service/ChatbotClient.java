package com.travelhub.backend.service;

import com.travelhub.backend.dto.ChatbotRequestDto;
import com.travelhub.backend.dto.ChatbotResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@Service
public class ChatbotClient {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotClient.class);
    private final RestTemplate restTemplate;

    @Value("${chatbot.service.url:http://localhost:8001}")
    private String chatbotUrl;

    public ChatbotClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends the user's prompt (with optional conversation history prepended)
     * to the Python AI service and returns the raw text reply.
     *
     * @param prompt  The current user message.
     * @param history Previous conversation messages [{role, text}, ...].
     *                Used to build a context-aware prompt so the AI can answer
     *                follow-up questions like "give those prices in LKR".
     */
    public String sendMessage(String prompt, List<Map<String, String>> history) {
        String contextualPrompt = buildContextualPrompt(prompt, history);

        ChatbotRequestDto request = new ChatbotRequestDto();
        request.setPrompt(contextualPrompt);

        try {
            ChatbotResponseDto response = restTemplate.postForObject(
                chatbotUrl + "/chat",
                request,
                ChatbotResponseDto.class
            );

            return response != null && response.getResponse() != null
                    ? response.getResponse()
                    : "No response from chatbot";
        } catch (Exception e) {
            logger.error("[ChatbotClient] Error calling Python AI: {}", e.getMessage());
            return "The assistant is temporarily unavailable. Please try again in a moment.";
        }
    }

    /**
     * Builds a context-enriched prompt by prepending the last N conversation
     * turns so the Python AI understands follow-up references like "that prices"
     * or "those packages".
     *
     * Example output sent to Python AI:
     *   [Previous conversation]
     *   User: What are Matale packages?
     *   Assistant: Spice & Spirituality costs $110/adult...
     *
     *   [Current question]
     *   give that prices in srilankan currency
     */
    private String buildContextualPrompt(String currentPrompt, List<Map<String, String>> history) {
        if (history == null || history.isEmpty()) {
            return currentPrompt;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("[Previous conversation]\n");
        for (Map<String, String> msg : history) {
            String role = msg.getOrDefault("role", "user");
            String text = msg.getOrDefault("text", "");
            // Skip the chatbot's own welcome/system message
            if (text.isBlank()) continue;
            String label = "bot".equalsIgnoreCase(role) ? "Assistant" : "User";
            sb.append(label).append(": ").append(text).append("\n");
        }
        sb.append("\n[Current question]\n").append(currentPrompt);
        return sb.toString();
    }

    public void triggerDataSync() {
        try {
            restTemplate.postForEntity(
                    chatbotUrl + "/sync",
                    null,
                    Map.class
            );
            logger.info("[ChatbotClient] Data sync triggered successfully");
        } catch (Exception e) {
            logger.error("[ChatbotClient] Sync failed: {}", e.getMessage());
        }
    }
}