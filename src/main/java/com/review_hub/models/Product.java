package com.review_hub.models;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "tab_product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private double price;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    private String category;
    private Double averageRating = 0.0;
    private Double sumOfGrades = 0.0;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String imgName;
    @OneToMany
    private List<Review> reviews;

    public String getImgName() {
        return imgName;
    }

    public void setImgName(String imgName) {
        this.imgName = imgName;
    }

    public Double getSumOfGrades() {
        return sumOfGrades;
    }

    public void setSumOfGrades(Double sumOfGrades) {
        this.sumOfGrades = sumOfGrades;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", description='" + description + '\'' +
                ", category='" + category + '\'' +
                ", averageRating=" + averageRating +
                ", sumOfGrades=" + sumOfGrades +
                ", imgName='" + imgName + '\'' +
                ", reviews=" + reviews +
                '}';
    }
}
