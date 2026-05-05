package com.travelhub.backend.dto.response;

public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String time;
    private Boolean read;

    public NotificationResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }

    public static class Builder {
        private Long id;
        private String type;
        private String title;
        private String message;
        private String time;
        private Boolean read;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder time(String time) { this.time = time; return this; }
        public Builder read(Boolean read) { this.read = read; return this; }

        public NotificationResponse build() {
            NotificationResponse r = new NotificationResponse();
            r.setId(id);
            r.setType(type);
            r.setTitle(title);
            r.setMessage(message);
            r.setTime(time);
            r.setRead(read);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}