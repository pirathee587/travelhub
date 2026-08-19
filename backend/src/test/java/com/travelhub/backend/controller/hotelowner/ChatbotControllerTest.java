package com.travelhub.backend.controller.hotelowner;

import com.travelhub.backend.controller.ChatbotController;
import com.travelhub.backend.dto.ChatbotRequestDto;
import com.travelhub.backend.dto.ChatbotResponseDto;
import com.travelhub.backend.service.ChatbotClient;
import com.travelhub.backend.service.ChatbotCurrencyService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.ResponseEntity;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class ChatbotControllerTest {

    @Mock
    private ChatbotClient chatbotClient;

    @Mock
    private ChatbotCurrencyService chatbotCurrencyService;

    @InjectMocks
    private ChatbotController chatbotController;

    // ─────────────────────────────────────────────────────────────
    // Test 1: Message Input — Submit valid message
    // ─────────────────────────────────────────────────────────────
    @Test(description = "chat with valid prompt should return processed response")
    public void chat_WithValidPrompt_ShouldReturnResponse() {
        // ARRANGE
        ChatbotRequestDto request = new ChatbotRequestDto();
        request.setPrompt("Hello chatbot");
        request.setHistory(new ArrayList<>());
        request.setCurrency("USD");

        when(chatbotClient.sendMessage(anyString(), any())).thenReturn("Hello from AI");
        when(chatbotCurrencyService.processForCurrency(anyString(), anyString(), anyString()))
                .thenReturn("Hello from AI (processed)");

        // ACT
        ResponseEntity<ChatbotResponseDto> response = chatbotController.chat(request);

        // ASSERT
        assertNotNull(response);
        assertEquals(response.getStatusCodeValue(), 200);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getResponse(), "Hello from AI (processed)");
    }

    // ─────────────────────────────────────────────────────────────
    // Test 2: Message Input — Attempt empty message
    // ─────────────────────────────────────────────────────────────
    @Test(description = "chat with empty prompt should return bad request")
    public void chat_WithEmptyPrompt_ShouldReturnBadRequest() {
        // ARRANGE
        ChatbotRequestDto request = new ChatbotRequestDto();
        request.setPrompt("   "); // empty/whitespace

        // ACT
        ResponseEntity<ChatbotResponseDto> response = chatbotController.chat(request);

        // ASSERT
        assertNotNull(response);
        assertEquals(response.getStatusCodeValue(), 400);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getResponse(), "Please type a question.");
        
        // Ensure backend service was not called
        verify(chatbotClient, never()).sendMessage(anyString(), any());
    }

    // ─────────────────────────────────────────────────────────────
    // Test 3: Error Handling — Graceful fallback (Simulated)
    // ─────────────────────────────────────────────────────────────
    @Test(description = "chat when AI is unreachable should return graceful fallback message")
    public void chat_WhenAiUnreachable_ShouldReturnFallback() {
        // ARRANGE
        ChatbotRequestDto request = new ChatbotRequestDto();
        request.setPrompt("Help me");
        request.setHistory(new ArrayList<>());
        
        // Simulate ChatbotClient returning its fallback message when python is down
        String fallbackMsg = "The assistant is temporarily unavailable. Please try again in a moment.";
        when(chatbotClient.sendMessage(anyString(), any())).thenReturn(fallbackMsg);
        
        when(chatbotCurrencyService.processForCurrency(anyString(), anyString(), anyString()))
                .thenReturn(fallbackMsg);

        // ACT
        ResponseEntity<ChatbotResponseDto> response = chatbotController.chat(request);

        // ASSERT
        assertNotNull(response);
        assertEquals(response.getStatusCodeValue(), 200); // Still 200 OK, just graceful text
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getResponse(), fallbackMsg);
    }
}
