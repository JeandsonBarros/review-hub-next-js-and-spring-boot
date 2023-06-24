package com.review_hub.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CodeRegistrationDTO {
    @NotNull(message = "code sent to the email is mandatory")
    private Long code;
    @Email(message = "must be a well-formed email address")
    @NotBlank(message = "email is required")
    private String email;

    public Long getCode() {
        return code;
    }

    public void setCode(Long code) {
        this.code = code;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
