package com.review_hub.models;

import java.util.Date;

public class Message {
    private int statusCode;
    private Date timestamp;
    private String message;
    private String description;

    public Message(int statusCode, Date timestamp, String message, String description) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.message = message;
        this.description = description;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return "Message{" +
                "statusCode=" + statusCode +
                ", timestamp=" + timestamp +
                ", message='" + message + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
