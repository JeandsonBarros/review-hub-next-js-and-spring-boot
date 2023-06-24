package com.review_hub.dtos;

import jakarta.validation.constraints.NotNull;

public class ReviewDTO {

    @NotNull(message = "productId is required")
    private Long productId;
    @NotNull(message = "note is required")
    private int note;
    private String comment;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getNote() {
        return note;
    }

    public void setNote(int note) {
        this.note = note;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
