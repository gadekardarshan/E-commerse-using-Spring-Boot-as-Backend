package com.example.e_commerce.repository;

import com.example.e_commerce.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ReviewRepository interface mapping SQL queries for ratings and comments.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Retrieve reviews for a product sorted latest first
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    // Retrieve reviews authored by a specific user
    List<Review> findByUserId(Long userId);
}
