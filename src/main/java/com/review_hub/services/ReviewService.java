package com.review_hub.services;

import com.review_hub.dtos.ReviewDTO;
import com.review_hub.models.Product;
import com.review_hub.models.Review;
import com.review_hub.repository.ProductRepository;
import com.review_hub.repository.ReviewRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private ProductRepository productRepository;

    public ResponseEntity<Object> createReview(ReviewDTO reviewDTO) {
        try {

            Optional<Product> product = productRepository.findById(reviewDTO.getProductId());
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found.", HttpStatus.NOT_FOUND);
            if (reviewDTO.getNote() > 5 || reviewDTO.getNote() < 1)
                return new ResponseEntity<>("The lowest possible grade is 1 (one), and the highest a is 5 (five).", HttpStatus.BAD_REQUEST);
            if (reviewRepository.findByProductAndUser(product.get(), userService.getUserDataLogged()).isPresent())
                return new ResponseEntity<>("You have already reviewed this product before.", HttpStatus.BAD_REQUEST);

            Review review = new Review();

            if (reviewDTO.getComment() != null && !reviewDTO.getComment().isEmpty()) {
                if (reviewDTO.getComment().length() <= 570) {
                    review.setComment(reviewDTO.getComment());
                } else {
                    return new ResponseEntity<>("The maximum number of characters in the comment is 570, you informed " + reviewDTO.getComment().length(), HttpStatus.BAD_REQUEST);
                }
            }

            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            LocalDateTime now = LocalDateTime.now();
            review.setNote(reviewDTO.getNote());
            review.setDate(dateTimeFormatter.format(now));
            review.setUser(userService.getUserDataLogged());
            review.setProduct(product.get());
            review = reviewRepository.save(review);

            double sumOfGrades = product.get().getSumOfGrades() + review.getNote();
            double amountOfNotes = reviewRepository.countByProduct(product.get());
            double averageRating = sumOfGrades / amountOfNotes;

            product.get().setAverageRating(averageRating);
            product.get().setSumOfGrades(sumOfGrades);
            productRepository.save(product.get());

            return new ResponseEntity<>(review, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error saving review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> listProductReviews(Long productId, Pageable pageable) {
        try {

            Optional<Product> product = productRepository.findById(productId);
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found.", HttpStatus.NOT_FOUND);

            Map<Object, Object> reviewStatistics = new HashMap<Object, Object>();
            reviewStatistics.put("sumOfGrades", product.get().getSumOfGrades());
            reviewStatistics.put("averageRating", product.get().getAverageRating());
            reviewStatistics.put("totalRatings", reviewRepository.countByProduct(product.get()));
            for (Integer cont = 1; cont <= 5; cont++) {
                reviewStatistics.put(cont, reviewRepository.countByProductAndNote(product.get(), cont));
            }

            Map<String, Object> body = new HashMap<String, Object>();
            body.put("reviews", reviewRepository.findByProduct(product.get(), pageable));
            body.put("reviewStatistics", reviewStatistics);

            return new ResponseEntity<>(body, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing product reviews", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> listProductReviewsByNote(Long productId, Integer note, Pageable pageable) {
        try {

            Optional<Product> product = productRepository.findById(productId);
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found.", HttpStatus.NOT_FOUND);

            return new ResponseEntity<>(reviewRepository.findByProductAndNote(product.get(), note, pageable), HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing product reviews by rating", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> updateReview(Long reviewId, ReviewDTO reviewDTO) {
        try {

            Optional<Product> product = productRepository.findById(reviewDTO.getProductId());
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found.", HttpStatus.NOT_FOUND);

            Optional<Review> review = reviewRepository.findByIdAndUser(reviewId, userService.getUserDataLogged());
            if (!review.isPresent())
                return new ResponseEntity<>("Review not found.", HttpStatus.NOT_FOUND);

            if (reviewDTO.getNote() > 5 || reviewDTO.getNote() < 1)
                return new ResponseEntity<>("The lowest possible grade is 1 (one), and the highest a is 5 (five).", HttpStatus.BAD_REQUEST);

            if (reviewDTO.getComment() != null && !reviewDTO.getComment().isEmpty()) {
                if (reviewDTO.getComment().length() <= 570) {
                    review.get().setComment(reviewDTO.getComment());
                } else {
                    return new ResponseEntity<>("The maximum number of characters in the comment is 570, you informed " + reviewDTO.getComment().length(), HttpStatus.BAD_REQUEST);
                }
            } else if (review.get().getComment() != null && !review.get().getComment().isEmpty()) {
                review.get().setComment("");
            }

            double sumOfGrades = (product.get().getSumOfGrades() - review.get().getNote()) + reviewDTO.getNote();
            double amountOfNotes = reviewRepository.countByProduct(product.get());
            double averageRating = sumOfGrades / amountOfNotes;

            product.get().setSumOfGrades(sumOfGrades);
            product.get().setAverageRating(averageRating);
            productRepository.save(product.get());

            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            LocalDateTime now = LocalDateTime.now();
            review.get().setDate(dateTimeFormatter.format(now) + " (Edited)");
            review.get().setProduct(review.get().getProduct());
            review.get().setUser(userService.getUserDataLogged());
            review.get().setNote(reviewDTO.getNote());
            Review reviewUpdated = reviewRepository.save(review.get());

            return new ResponseEntity<>(reviewUpdated, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updated review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> selectUserReviews(Pageable pageable) {
        try {
            return new ResponseEntity<>(reviewRepository.findByUser(userService.getUserDataLogged(), pageable), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error listing user rating", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> selectUserReviewByProduct(Long productId) {
        try {
            Optional<Product> product = productRepository.findById(productId);
            if (!product.isPresent())
                return new ResponseEntity<>("Product not found.", HttpStatus.NOT_FOUND);

            Optional<Review> review = reviewRepository.findByProductAndUser(product.get(), userService.getUserDataLogged());
            if (!review.isPresent())
                return new ResponseEntity<>("Review not found.", HttpStatus.NOT_FOUND);

            return new ResponseEntity<>(review.get(), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error geting review", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Object> deleteReviews(Long evaluationId) {
        try {

            Optional<Review> evaluation = reviewRepository.findByIdAndUser(evaluationId, userService.getUserDataLogged());
            if (!evaluation.isPresent())
                return new ResponseEntity<>("Review not found.", HttpStatus.NOT_FOUND);

            Optional<Product> product = productRepository.findById(evaluation.get().getProduct().getId());
            if (!product.isPresent())
                return new ResponseEntity<>("Product of review not found", HttpStatus.NOT_FOUND);

            double sumOfGrades = product.get().getSumOfGrades() - evaluation.get().getNote();
            double amountOfNotes = reviewRepository.countByProduct(product.get()) - 1;
            double averageRating = amountOfNotes == 0 ? 0.0 : sumOfGrades / amountOfNotes;

            product.get().setSumOfGrades(sumOfGrades);
            product.get().setAverageRating(averageRating);
            productRepository.save(product.get());

            reviewRepository.deleteById(evaluationId);
            return new ResponseEntity<>("Successfully deleted", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting review.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
