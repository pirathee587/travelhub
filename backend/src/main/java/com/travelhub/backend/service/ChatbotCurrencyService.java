package com.travelhub.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.NumberFormat;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ChatbotCurrencyService
 *
 * Post-processes the Python AI chatbot's raw text reply to convert USD prices
 * to Sri Lankan Rupees (LKR) when the tourist's currency preference is "LKR".
 *
 * Consistency with the Tourist Dashboard:
 *   - Uses the same exchange-rate source: https://open.er-api.com/v6/latest/USD
 *   - Uses the same formatting convention: "Rs. X,XXX" (matching TouristCurrencyContext.tsx)
 *   - Falls back gracefully to USD if the rate API is unreachable
 *
 * LKR Intent Detection:
 *   - Triggered when the ChatbotRequestDto.currency field equals "LKR" (set by
 *     the frontend from the tourist's saved TouristCurrencyContext preference), OR
 *   - Triggered when the user's prompt explicitly mentions LKR / Rupees / Sri Lankan
 *     Rupees keywords, even if currency preference is USD.
 */
@Service
@RequiredArgsConstructor
public class ChatbotCurrencyService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotCurrencyService.class);

    private static final String RATE_API_URL = "https://open.er-api.com/v6/latest/USD";

    /**
     * Matches USD price patterns in the AI's natural-language response:
     *   $150        → $150
     *   $1,200.50   → $1,200.50
     *   USD 200     → USD 200
     *   US$ 300     → US$ 300
     */
    private static final Pattern USD_PRICE_PATTERN = Pattern.compile(
            "(?:USD\\s*|US\\$\\s*|\\$)([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Matches explicit LKR/Rupees intent in the user's prompt.
     *
     * Covers all common phrasings tourists use:
     *   • "LKR" / "in LKR" / "LKR price"
     *   • "rupee" / "rupees" / "in rupees"
     *   • "sri lankan currency" / "srilankan currency" (with OR without space)
     *   • "sri lankan rupees" / "srilankan rupees"
     *   • "sri lanka currency" / "srilanka currency"
     *   • "local currency" (implied Sri Lanka context)
     */
    private static final Pattern LKR_INTENT_PATTERN = Pattern.compile(
            "\\b(lkr|rupee[s]?|in\\s+rupee[s]?|in\\s+lkr"
            + "|sri\\s*lanka[n]?\\s+(?:currency|rupee[s]?)"
            + "|srilanka[n]?\\s+(?:currency|rupee[s]?))\\b",
            Pattern.CASE_INSENSITIVE
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // ──────────────────────────────────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Main entry point called by ChatbotController after getting the raw AI reply.
     *
     * @param prompt    The tourist's original message.
     * @param aiReply   Raw text reply from the Python AI service (may contain "$X.XX").
     * @param currency  "LKR" or "USD" (from ChatbotRequestDto, read from TouristCurrencyContext).
     * @return          The processed reply with LKR prices if applicable, or the original reply.
     */
    public String processForCurrency(String prompt, String aiReply, String currency) {
        boolean shouldConvert = "LKR".equalsIgnoreCase(currency)
                || (prompt != null && LKR_INTENT_PATTERN.matcher(prompt).find());

        if (!shouldConvert) {
            return aiReply;
        }

        Double rate = fetchLiveUsdToLkrRate();

        if (rate == null) {
            // Rate API unavailable — append a note but do not modify prices
            log.warn("[ChatbotCurrencyService] Live rate unavailable; returning USD prices.");
            return aiReply + "\n\n"
                    + "⚠️ Note: Could not retrieve the live exchange rate at this time. "
                    + "Prices are shown in USD. Please check a currency converter for the current LKR equivalent.";
        }

        return convertUsdPricesToLkr(aiReply, rate);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Calls open.er-api.com to get the live USD → LKR rate.
     * Returns null if the request fails or the rate is missing.
     */
    Double fetchLiveUsdToLkrRate() {
        try {
            String json = restTemplate.getForObject(RATE_API_URL, String.class);
            if (json == null) return null;

            JsonNode root = objectMapper.readTree(json);
            JsonNode lkrNode = root.path("rates").path("LKR");
            if (!lkrNode.isMissingNode() && lkrNode.isNumber()) {
                double rate = lkrNode.doubleValue();
                log.debug("[ChatbotCurrencyService] Live USD→LKR rate: {}", rate);
                return rate;
            }
        } catch (Exception e) {
            log.error("[ChatbotCurrencyService] Failed to fetch exchange rate: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Scans the AI reply text for USD price patterns and replaces each one with
     * the LKR equivalent formatted as "Rs. X,XXX (≈ $Y)".
     *
     * Example:
     *   Input:  "The suite costs $150 per night."
     *   Output: "The suite costs Rs. 48,150 (≈ $150) per night.
     *            (Exchange rate: 1 USD ≈ 321 LKR)"
     */
    String convertUsdPricesToLkr(String text, double rate) {
        if (text == null || text.isBlank()) return text;

        NumberFormat lkrFormat = NumberFormat.getNumberInstance(Locale.US);
        lkrFormat.setMaximumFractionDigits(0);
        lkrFormat.setGroupingUsed(true);

        Matcher matcher = USD_PRICE_PATTERN.matcher(text);
        StringBuffer result = new StringBuffer();
        boolean anyConverted = false;

        while (matcher.find()) {
            // Remove thousands separators before parsing
            String rawNumber = matcher.group(1).replace(",", "");
            try {
                double usdValue = Double.parseDouble(rawNumber);
                double lkrValue = usdValue * rate;

                String lkrFormatted = "Rs. " + lkrFormat.format(lkrValue);
                // Preserve the original USD text in parentheses for transparency
                String replacement = lkrFormatted + " (≈ " + matcher.group(0) + ")";
                matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
                anyConverted = true;
            } catch (NumberFormatException e) {
                // Could not parse — leave unchanged
                matcher.appendReplacement(result, Matcher.quoteReplacement(matcher.group(0)));
            }
        }
        matcher.appendTail(result);

        // Append the live rate footnote once, only if we actually converted something
        if (anyConverted) {
            result.append(String.format(
                    "%n%n💱 Exchange rate used: 1 USD ≈ %s LKR (live rate from open.er-api.com)",
                    lkrFormat.format(rate)
            ));
        }

        return result.toString();
    }
}
