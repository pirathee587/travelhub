package com.travelhub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.List;

@Component
public class EmailTemplateBuilder {

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.email-logo-url:https://travelhublanka.netlify.app/TravelHUB.png}")
    private String emailLogoUrl;

    @Value("${app.support-email:hello@travelhub.lk}")
    private String supportEmail;

    public String render(EmailContent content) {
        String logoUrl = emailLogoUrl;
        String homeUrl = trimTrailingSlash(baseUrl);
        String recipient = content.recipientName() != null && !content.recipientName().isBlank()
                ? escape(content.recipientName())
                : "there";

        StringBuilder body = new StringBuilder();
        body.append("<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;\">")
                .append("Dear <strong>").append(recipient).append("</strong>,</p>");

        if (content.intro() != null && !content.intro().isBlank()) {
            body.append("<p style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;\">")
                    .append(content.intro())
                    .append("</p>");
        }

        if (content.detailsHtml() != null && !content.detailsHtml().isBlank()) {
            body.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" ")
                    .append("style=\"margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;\">")
                    .append("<tr><td style=\"padding:16px 18px;font-size:14px;line-height:1.7;color:#334155;\">")
                    .append(content.detailsHtml())
                    .append("</td></tr></table>");
        }

        if (content.bodyHtml() != null && !content.bodyHtml().isBlank()) {
            body.append("<div style=\"margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;\">")
                    .append(content.bodyHtml())
                    .append("</div>");
        }

        if (content.alertHtml() != null && !content.alertHtml().isBlank()) {
            body.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" ")
                    .append("style=\"margin:0 0 20px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;\">")
                    .append("<tr><td style=\"padding:14px 16px;font-size:14px;line-height:1.6;color:#b91c1c;\">")
                    .append(content.alertHtml())
                    .append("</td></tr></table>");
        }

        if (!content.buttons().isEmpty()) {
            body.append("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:8px 0 20px;\"><tr>");
            for (int i = 0; i < content.buttons().size(); i++) {
                EmailButton button = content.buttons().get(i);
                if (i > 0) {
                    body.append("<td style=\"width:12px;\"></td>");
                }
                body.append("<td>").append(renderButton(button)).append("</td>");
            }
            body.append("</tr></table>");
        }

        if (content.footerNote() != null && !content.footerNote().isBlank()) {
            body.append("<p style=\"margin:0 0 16px;font-size:13px;line-height:1.6;color:#64748b;\">")
                    .append(content.footerNote())
                    .append("</p>");
        }

        String closingTeam = content.closingTeam() != null ? content.closingTeam() : "TravelHub Team";
        body.append("<p style=\"margin:0;font-size:15px;line-height:1.6;color:#334155;\">")
                .append("Warm regards,<br/><strong>").append(escape(closingTeam)).append("</strong></p>");

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
                          <tr>
                            <td style="padding:28px 28px 20px;text-align:center;background:linear-gradient(135deg,#0f766e,#0891b2);">
                              <a href="%s" style="text-decoration:none;display:inline-block;">
                                <img src="%s" alt="" width="64" style="display:block;margin:0 auto 10px;border:0;max-width:64px;height:auto;"/>
                                <p style="margin:0 0 6px;font-size:26px;line-height:1.2;font-weight:bold;color:#ffffff;letter-spacing:0.3px;">TravelHub</p>
                              </a>
                              <p style="margin:0;font-size:13px;line-height:1.5;color:#ecfeff;letter-spacing:0.4px;">Your gateway to unforgettable journeys in Sri Lanka</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px 28px 8px;">
                              <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#0f172a;">%s</h1>
                              %s
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:8px 28px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
                              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
                                Need help? Contact us at <a href="mailto:%s" style="color:#0d9488;text-decoration:none;">%s</a>
                              </p>
                              <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;text-align:center;">
                                &copy; %d TravelHub Sri Lanka. This is an automated message — please do not reply directly to this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escape(content.headline()),
                homeUrl,
                logoUrl,
                escape(content.headline()),
                body,
                supportEmail,
                supportEmail,
                java.time.Year.now().getValue()
        );
    }

    public String escape(String value) {
        if (value == null) {
            return "";
        }
        return HtmlUtils.htmlEscape(value);
    }

    public String detailRow(String label, String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return "<p style=\"margin:0 0 8px;\"><span style=\"color:#64748b;\">" + escape(label)
                + ":</span> <strong style=\"color:#0f172a;\">" + escape(value) + "</strong></p>";
    }

    public String detailRowHtml(String label, String htmlValue) {
        if (htmlValue == null || htmlValue.isBlank()) {
            return "";
        }
        return "<p style=\"margin:0 0 8px;\"><span style=\"color:#64748b;\">" + escape(label)
                + ":</span> <strong style=\"color:#0f172a;\">" + htmlValue + "</strong></p>";
    }

    public EmailContent.Builder content(String headline) {
        return EmailContent.builder(headline);
    }

    private String renderButton(EmailButton button) {
        String background = switch (button.style()) {
            case DANGER -> "background:#dc2626;";
            case SUCCESS -> "background:#059669;";
            default -> "background:linear-gradient(135deg,#0d9488,#0891b2);";
        };
        return "<a href=\"" + button.url() + "\" style=\"display:inline-block;" + background
                + "color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;"
                + "padding:12px 20px;border-radius:10px;\">" + escape(button.label()) + "</a>";
    }

    private String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public record EmailButton(String label, String url, ButtonStyle style) {
        public static EmailButton primary(String label, String url) {
            return new EmailButton(label, url, ButtonStyle.PRIMARY);
        }

        public static EmailButton success(String label, String url) {
            return new EmailButton(label, url, ButtonStyle.SUCCESS);
        }

        public static EmailButton danger(String label, String url) {
            return new EmailButton(label, url, ButtonStyle.DANGER);
        }
    }

    public enum ButtonStyle {
        PRIMARY, SUCCESS, DANGER
    }

    public record EmailContent(
            String headline,
            String recipientName,
            String intro,
            String detailsHtml,
            String bodyHtml,
            String alertHtml,
            List<EmailButton> buttons,
            String footerNote,
            String closingTeam
    ) {
        public static Builder builder(String headline) {
            return new Builder(headline);
        }

        public static class Builder {
            private final String headline;
            private String recipientName;
            private String intro;
            private String detailsHtml;
            private String bodyHtml;
            private String alertHtml;
            private final List<EmailButton> buttons = new ArrayList<>();
            private String footerNote;
            private String closingTeam;

            private Builder(String headline) {
                this.headline = headline;
            }

            public Builder recipientName(String recipientName) {
                this.recipientName = recipientName;
                return this;
            }

            public Builder intro(String intro) {
                this.intro = intro;
                return this;
            }

            public Builder detailsHtml(String detailsHtml) {
                this.detailsHtml = detailsHtml;
                return this;
            }

            public Builder bodyHtml(String bodyHtml) {
                this.bodyHtml = bodyHtml;
                return this;
            }

            public Builder alertHtml(String alertHtml) {
                this.alertHtml = alertHtml;
                return this;
            }

            public Builder button(EmailButton button) {
                this.buttons.add(button);
                return this;
            }

            public Builder footerNote(String footerNote) {
                this.footerNote = footerNote;
                return this;
            }

            public Builder closingTeam(String closingTeam) {
                this.closingTeam = closingTeam;
                return this;
            }

            public EmailContent build() {
                return new EmailContent(headline, recipientName, intro, detailsHtml, bodyHtml, alertHtml,
                        List.copyOf(buttons), footerNote, closingTeam);
            }
        }
    }
}
