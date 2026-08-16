package com.travelhub.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ChatbotRequestDto {
    private String prompt;

    /**
     * The tourist's display currency preference: "USD" (default) or "LKR".
     * Sent by the frontend using the TouristCurrencyContext value.
     * If null or unrecognised, defaults to "USD" in the controller.
     */
    private String currency;

    /**
     * Last N messages from the chat UI (role: "user"|"bot", text: message text).
     * Used by ChatbotClient to build a context-aware prompt so the Python AI
     * can understand follow-up questions like "give those prices in LKR".
     */
    private List<Map<String, String>> history;
}

