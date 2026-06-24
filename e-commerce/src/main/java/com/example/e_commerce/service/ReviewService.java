package com.example.e_commerce.service;

import com.example.e_commerce.dto.ReviewRequest;
import com.example.e_commerce.dto.ReviewResponse;
import com.example.e_commerce.model.Product;
import com.example.e_commerce.model.Rating;
import com.example.e_commerce.model.Review;
import com.example.e_commerce.model.User;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.ReviewRepository;
import com.example.e_commerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * ReviewService class managing writing and loading customer reviews, plus recalculating product ratings.
 */
@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Adds a customer review and recalculates the product's rating average and count
    @Transactional
    public ReviewResponse addReview(ReviewRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        // Update product overall rating
        recalculateProductRating(product);

        return mapToResponse(savedReview);
    }

    // Fetches all reviews for a specific product
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Deletes review if authorized (author or ADMIN) and recalculates product rating
    @Transactional
    public void deleteReview(Long id, Long userId, String userRole) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + id));

        // Check if user is the author or an admin
        boolean isAdmin = userRole.equalsIgnoreCase("ADMIN") || userRole.equalsIgnoreCase("ROLE_ADMIN");
        if (!review.getUser().getId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized to delete this review");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate rating
        recalculateProductRating(product);
    }

    // Recalculates average rating and rating count of a product based on database reviews
    private void recalculateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        Rating rating = product.getRating();
        
        if (rating == null) {
            rating = new Rating();
        }

        if (reviews.isEmpty()) {
            rating.setRate(0.0);
            rating.setCount(0);
        } else {
            double sum = reviews.stream().mapToDouble(Review::getRating).sum();
            rating.setRate(Math.round((sum / reviews.size()) * 10.0) / 10.0); // round to 1 decimal place
            rating.setCount(reviews.size());
        }

        product.setRating(rating);
        productRepository.save(product);
    }

    // Helper method mapping Review entity to ReviewResponse DTO
    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserName(review.getUser().getName());
        response.setProductId(review.getProduct().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
