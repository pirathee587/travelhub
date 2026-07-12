package com.travelhub.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    // RestTemplate is Spring Boot's built-in HTTP client
    // We use it to call our Python FastAPI AI service
    private final RestTemplate restTemplate = new RestTemplate();

    // Python AI service runs separately on port 8001
    private static final String PYTHON_AI_URL = "http://localhost:8001";

    /**
     * Sends the tourist's question to the Python AI service.
     * The Python service does the RAG search and calls Groq LLM.
     * Returns the AI-generated text answer.
     */
    public String getAIReply(String userPrompt) {
        try {
            // Build the JSON body to send to Python
            // Python expects: { "prompt": "user question" }
            Map<String, String> requestBody = Map.of("prompt", userPrompt);

            // Set Content-Type: application/json header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // Call Python FastAPI: POST http://localhost:8001/chat
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PYTHON_AI_URL + "/chat",
                    entity,
                    Map.class
            );

            // Python returns: { "response": "AI answer text" }
            if (response.getBody() != null && response.getBody().containsKey("response")) {
                return (String) response.getBody().get("response");
            }

            return "I could not get a response. Please try again.";

        } catch (Exception e) {
            // If Python service is down or crashed, show a friendly message
            logger.error("[ChatbotService] Error calling Python AI: {}", e.getMessage());
            return "The assistant is temporarily unavailable. Please try again in a moment.";
        }
    }

    /**
     * Tells the Python AI service to re-sync data from Supabase into ChromaDB.
     * Call this after admin creates or updates a travel package or hotel,
     * so the AI always knows about the latest data.
     */
    public void triggerDataSync() {
        try {
            restTemplate.postForEntity(
                    PYTHON_AI_URL + "/sync",
                    null,
                    Map.class
            );
            logger.info("[ChatbotService] Data sync triggered successfully");
        } catch (Exception e) {
            logger.error("[ChatbotService] Sync failed: {}", e.getMessage());
        }
    }
}