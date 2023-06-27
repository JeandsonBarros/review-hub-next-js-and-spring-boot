package com.review_hub.services;

import com.review_hub.dtos.ReviewDTO;
import com.review_hub.models.Product;
import com.review_hub.models.ProductReviewStatistics;
import com.review_hub.models.Review;
import com.review_hub.repository.ProductRepository;
import com.review_hub.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.webjars.NotFoundException;

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
    private Review review;

    public Page<Review> listAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable);
    }


    public Page<Review>  listReviewsByNote(Integer note, Pageable pageable) {
        return reviewRepository.findByNote(note, pageable);
    }

    public Review getReview(Long reviewId){
        Optional<Review> review = reviewRepository.findById(reviewId);
        if(!review.isPresent()){
            throw new NotFoundException("Review by id "+reviewId+" not found");
        }

        return review.get();
    }

    public Review createReview(ReviewDTO reviewDTO) {

        Optional<Product> product = productRepository.findById(reviewDTO.getProductId());
        if (!product.isPresent())
            throw new NotFoundException("Product not found.");
        if (reviewDTO.getNote() > 5 || reviewDTO.getNote() < 1)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The lowest possible grade is 1 (one), and the highest a is 5 (five).");
        if (reviewRepository.findByProductAndUser(product.get(), userService.getUserDataLogged()).isPresent())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already reviewed this product before.");

        Review review = new Review();

        if (reviewDTO.getComment() != null && !reviewDTO.getComment().isEmpty()) {
            if (reviewDTO.getComment().length() <= 570) {
                review.setComment(reviewDTO.getComment());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The maximum number of characters in the comment is 570, you informed " + reviewDTO.getComment().length());
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
        double averageReviews = sumOfGrades / amountOfNotes;

        product.get().setAverageReviews(averageReviews);
        product.get().setSumOfGrades(sumOfGrades);
        productRepository.save(product.get());

        return review;

    }

    public Page<Review> listProductReviews(Long productId, Pageable pageable) {

        Optional<Product> product = productRepository.findById(productId);
        if (!product.isPresent()) {
            throw new NotFoundException("Product not found.");
        }

        return reviewRepository.findByProduct(product.get(), pageable);

    }

    public ProductReviewStatistics getProductReviewStatistics(Long productId) {

        Optional<Product> product = productRepository.findById(productId);
        if (!product.isPresent()) {
            throw new NotFoundException("Product not found.");
        }

        Map<Integer, Long> quantityOfEachNote = new HashMap<Integer, Long>();
        for (Integer cont = 1; cont <= 5; cont++) {
            quantityOfEachNote.put(cont, reviewRepository.countByProductAndNote(product.get(), cont));
        }

        ProductReviewStatistics productReviewStatistics = new ProductReviewStatistics(
                product.get().getAverageReviews(),
                product.get().getSumOfGrades(),
                reviewRepository.countByProduct(product.get()),
                (product.get().getAverageReviews()/5.0)*100,
                product.get(),
                quantityOfEachNote
        );

        return productReviewStatistics;

    }

    public Page<Review> listProductReviewsByNote(Long productId, Integer note, Pageable pageable) {

        Optional<Product> product = productRepository.findById(productId);
        if (!product.isPresent())
            throw new NotFoundException("Product not found.");

        return reviewRepository.findByProductAndNote(product.get(), note, pageable);

    }

    public Review updateReview(Long reviewId, ReviewDTO reviewDTO) {

        Optional<Review> review = reviewRepository.findByIdAndUser(reviewId, userService.getUserDataLogged());
        if (!review.isPresent()) {
            throw new NotFoundException("Review not found.");
        }

        if (reviewDTO.getNote() > 5 || reviewDTO.getNote() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The lowest possible grade is 1 (one), and the highest a is 5 (five).");
        }
        if (reviewDTO.getComment() != null && !reviewDTO.getComment().isEmpty()) {
            if (reviewDTO.getComment().length() <= 570) {
                review.get().setComment(reviewDTO.getComment());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The maximum number of characters in the comment is 570, you informed " + reviewDTO.getComment().length());
            }
        } else if (review.get().getComment() != null && !review.get().getComment().isEmpty()) {
            review.get().setComment("");
        }

        Product product = review.get().getProduct();

        double sumOfGrades = (product.getSumOfGrades() - review.get().getNote()) + reviewDTO.getNote();
        double amountOfNotes = reviewRepository.countByProduct(product);
        double averageReviews = sumOfGrades / amountOfNotes;

        product.setSumOfGrades(sumOfGrades);
        product.setAverageReviews(averageReviews);
        productRepository.save(product);

        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDateTime now = LocalDateTime.now();
        review.get().setDate(dateTimeFormatter.format(now) + " (Edited)");
        review.get().setProduct(review.get().getProduct());
        review.get().setUser(userService.getUserDataLogged());
        review.get().setNote(reviewDTO.getNote());

        return reviewRepository.save(review.get());

    }

    public Page<Review> selectUserReviews(Pageable pageable) {
        return reviewRepository.findByUser(userService.getUserDataLogged(), pageable);
    }

    public Review selectUserReviewByProduct(Long productId) {

        Optional<Product> product = productRepository.findById(productId);
        if (!product.isPresent()) {
            throw new NotFoundException("Product not found.");
        }
        Optional<Review> review = reviewRepository.findByProductAndUser(product.get(), userService.getUserDataLogged());
        if (!review.isPresent()) {
            throw new NotFoundException("Review not found.");
        }

        return review.get();

    }

    public void deleteReviews(Long evaluationId) {

        Optional<Review> evaluation = reviewRepository.findByIdAndUser(evaluationId, userService.getUserDataLogged());
        if (!evaluation.isPresent()) {
            throw new NotFoundException("Review not found.");
        }

        Product product = productRepository.findById(evaluation.get().getProduct().getId()).get();

        double sumOfGrades = product.getSumOfGrades() - evaluation.get().getNote();
        double amountOfNotes = reviewRepository.countByProduct(product) - 1;
        double averageReviews = amountOfNotes == 0 ? 0.0 : sumOfGrades / amountOfNotes;

        product.setSumOfGrades(sumOfGrades);
        product.setAverageReviews(averageReviews);
        productRepository.save(product);

        reviewRepository.deleteById(evaluationId);

    }


}
