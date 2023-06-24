package com.review_hub.controllers;

import com.review_hub.dtos.ReviewDTO;
import com.review_hub.services.ReviewService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
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

    @GetMapping("/{productId}")
    public ResponseEntity<Object> getProducReviews(
            @PageableDefault(size = 30, sort = "date", direction = Sort.Direction.ASC) Pageable pageable,
            @PathVariable Long productId,
            @RequestParam(required = false) Integer note
    ){

        if(note != null)
            return reviewService.listProductReviewsByNote(productId, note, pageable);

        return reviewService.listProductReviews(productId, pageable);
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user-reviews")
    public ResponseEntity<Object> getUserRatings(@PageableDefault(size = 30, sort = "note", direction = Sort.Direction.DESC) Pageable pageable){
        return reviewService.selectUserReviews(pageable);
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user-review-by-product/{productId}")
    public ResponseEntity<Object> selectUserReviewByProduct(@PathVariable Long productId){
        return reviewService.selectUserReviewByProduct(productId);
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping
    public ResponseEntity<Object> postReview(@Valid @RequestBody ReviewDTO reviewDTO, BindingResult result){
        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return reviewService.createReview(reviewDTO);
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{reviewId}")
    public ResponseEntity<Object> putReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewDTO reviewDTO, BindingResult result){
        if (result.hasErrors())
            return new ResponseEntity<>(result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.toList()), HttpStatus.BAD_REQUEST);

        return reviewService.updateReview(reviewId, reviewDTO);
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Object> deleteReviews(@PathVariable Long reviewId){
        return reviewService.deleteReviews(reviewId);
    }

}
