package com.review_hub.controllers;

import com.review_hub.dtos.ReviewDTO;
import com.review_hub.models.ProductReviewStatistics;
import com.review_hub.models.Review;
import com.review_hub.services.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/review/")
@Tag(name = "Review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get all reviews or reviews by note| Authority: Permit All")
    @GetMapping
    public ResponseEntity<Page<Review>> getAllReviews(
            @PageableDefault(size = 30, sort = "date", direction = Sort.Direction.ASC) Pageable pageable,
            @RequestParam(required = false) Integer note
    ) {

        if (note != null) {
            return new ResponseEntity<>(reviewService.listReviewsByNote(note, pageable), HttpStatus.OK);
        }

        return new ResponseEntity<>(reviewService.listAllReviews(pageable), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get review by id| Authority: Permit All")
    @GetMapping("/{reviewId}")
    public ResponseEntity<Review> getReview(@PathVariable Long reviewId) {
        return new ResponseEntity<>(reviewService.getReview(reviewId), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get reviews by product| Authority: Permit All")
    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<Review>> getProducReviews(
            @PageableDefault(size = 30, sort = "date", direction = Sort.Direction.ASC) Pageable pageable,
            @PathVariable Long productId,
            @RequestParam(required = false) Integer note
    ) {

        if (note != null) {
            return new ResponseEntity<>(reviewService.listProductReviewsByNote(productId, note, pageable), HttpStatus.OK);
        }

        return new ResponseEntity<>(reviewService.listProductReviews(productId, pageable), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get product review statistics | Authority: Permit All")
    @GetMapping("/product/{productId}/statistics")
    public ResponseEntity<ProductReviewStatistics> getProductReviewStatistics(@PathVariable Long productId) {
        return new ResponseEntity<>(reviewService.getProductReviewStatistics(productId), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get user reviews | Authority: Authenticated")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user-reviews")
    public ResponseEntity<Page<Review>> getUserRatings(@PageableDefault(size = 30, sort = "note", direction = Sort.Direction.DESC) Pageable pageable) {
        return new ResponseEntity<>(reviewService.selectUserReviews(pageable), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Get user a review by product | Authority: Authenticated")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user-review-by-product/{productId}")
    public ResponseEntity<Review> selectUserReviewByProduct(@PathVariable Long productId) {
        return new ResponseEntity<>(reviewService.selectUserReviewByProduct(productId), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "201")
    @Operation(summary = "Create a review | Authority: Authenticated")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<Review> postReview(@Valid @RequestBody ReviewDTO reviewDTO) {
        return new ResponseEntity<>(reviewService.createReview(reviewDTO), HttpStatus.CREATED);
    }

    @ApiResponse(responseCode = "200")
    @Operation(summary = "Update a review | Authority: Authenticated")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{reviewId}")
    public ResponseEntity<Object> putReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewDTO reviewDTO) {
        return new ResponseEntity<>(reviewService.updateReview(reviewId, reviewDTO), HttpStatus.OK);
    }

    @ApiResponse(responseCode = "204")
    @Operation(summary = "Delete a review | Authority: Authenticated")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReviews(@PathVariable Long reviewId) {
        reviewService.deleteReviews(reviewId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
