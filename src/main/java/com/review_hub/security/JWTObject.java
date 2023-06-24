package com.review_hub.security;

import java.util.Date;

public class JWTObject {

    private String subject; // username or email of the user
    private Long userId;
    private Date issuedAt; // token Creation Date
    private String role; // access profile functions

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Date getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(Date issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "JWTObject{" +
                "subject='" + subject + '\'' +
                ", userId=" + userId +
                ", issuedAt=" + issuedAt +
                ", role='" + role + '\'' +
                '}';
    }
}