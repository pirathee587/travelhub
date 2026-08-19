package com.travelhub.backend.service;

import com.travelhub.backend.service.EmailTemplateBuilder.EmailButton;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailActionPageBuilder {

    private final EmailTemplateBuilder templates;

    public String reviewRequired(String headline, String message, String dashboardUrl) {
        return templates.render(templates.content(headline)
                .intro(message)
                .bodyHtml("Open the booking in your agency dashboard to assign a vehicle and driver, then confirm the booking.")
                .button(EmailButton.primary("Open Booking in Dashboard", dashboardUrl))
                .footerNote("One-click approval from email is not available until resources are assigned.")
                .build());
    }

    public String success(String headline, String message, String buttonLabel, String buttonUrl) {
        return templates.render(templates.content(headline)
                .intro(message)
                .button(EmailButton.success(buttonLabel, buttonUrl))
                .build());
    }

    public String error(String headline, String message, String buttonLabel, String buttonUrl) {
        return templates.render(templates.content(headline)
                .intro(message)
                .alertHtml("If this problem continues, please sign in to your dashboard or contact TravelHub support.")
                .button(EmailButton.primary(buttonLabel, buttonUrl))
                .build());
    }
}
