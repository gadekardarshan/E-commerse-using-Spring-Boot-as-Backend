package com.example.e_commerce.controller;

import com.example.e_commerce.dto.ReviewRequest;
import com.example.e_commerce.dto.ReviewResponse;
import com.example.e_commerce.security.CustomUserDetails;
import com.example.e_commerce.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ReviewController managing product reviews: adding, listing, and deletions.
 */
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Public endpoint: Fetch reviews for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    // Authenticated endpoint: Submit a review comment and rating for a product
    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.addReview(request);
        return ResponseEntity.ok(response);
    }

    // Authenticated endpoint: Delete a review comment (requires author ownership or ADMIN role)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(
            @PathVariable Long id, 
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        reviewService.deleteReview(id, userDetails.getUser().getId(), userDetails.getUser().getRole());
        return ResponseEntity.ok("Review deleted successfully");
    }
}
