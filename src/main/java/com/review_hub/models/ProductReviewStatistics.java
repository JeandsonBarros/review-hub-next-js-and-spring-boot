package com.review_hub.models;

import jakarta.persistence.*;

import java.util.List;
import java.util.Map;

public class ProductReviewStatistics {

    private Double averageReviews;
    private Double sumOfGrades;
    private Long totalReviews;
    private Double approvalPercentage;
    private Product product;
    private Map<Integer, Long> quantityOfEachNote;

    public ProductReviewStatistics() {
    }

    public ProductReviewStatistics(Double averageReviews, Double sumOfGrades, Long totalReviews, Double approvalPercentage, Product product, Map<Integer, Long> quantityOfEachNote) {
        this.averageReviews = averageReviews;
        this.sumOfGrades = sumOfGrades;
        this.totalReviews = totalReviews;
        this.approvalPercentage = approvalPercentage;
        this.product = product;
        this.quantityOfEachNote = quantityOfEachNote;
    }

    public Double getAverageReviews() {
        return averageReviews;
    }

    public void setAverageReviews(Double averageReviews) {
        this.averageReviews = averageReviews;
    }

    public Double getSumOfGrades() {
        return sumOfGrades;
    }

    public void setSumOfGrades(Double sumOfGrades) {
        this.sumOfGrades = sumOfGrades;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Double getApprovalPercentage() {
        return approvalPercentage;
    }

    public void setApprovalPercentage(Double approvalPercentage) {
        this.approvalPercentage = approvalPercentage;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Map<Integer, Long> getQuantityOfEachNote() {
        return quantityOfEachNote;
    }

    public void setQuantityOfEachNote(Map<Integer, Long> quantityOfEachNote) {
        this.quantityOfEachNote = quantityOfEachNote;
    }
}
