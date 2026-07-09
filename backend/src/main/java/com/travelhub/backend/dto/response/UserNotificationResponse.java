package com.travelhub.backend.dto.response;

public class UserNotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String actionUrl;
    private String time;
    private Boolean read;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
}
