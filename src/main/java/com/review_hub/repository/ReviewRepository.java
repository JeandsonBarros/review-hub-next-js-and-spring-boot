package com.review_hub.repository;

import com.review_hub.models.Review;
import com.review_hub.models.Product;
import com.review_hub.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Long countByProduct(Product product);
    Long countByProductAndNote(Product product, Integer note);
    Optional<Review> findByProductAndUser(Product product, User userLogged);
    Optional<Review> findByIdAndUser(Long id, User userLogged);
    Page<Review> findByProduct(Product product, Pageable pageable);
    Page<Review> findByUser(User userLogged, Pageable pageable);
    Page<Review> findByProductAndNote(Product product, Integer note,  Pageable pageable);

}
