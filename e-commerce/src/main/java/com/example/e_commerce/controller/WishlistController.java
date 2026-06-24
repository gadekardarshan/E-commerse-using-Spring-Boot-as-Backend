package com.example.e_commerce.controller;

import com.example.e_commerce.dto.WishlistResponse;
import com.example.e_commerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * WishlistController managing customer bookmarked items: view, add, and remove.
 */
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    // Fetch wishlist items saved by a user
    @GetMapping("/{userId}")
    public ResponseEntity<WishlistResponse> getWishlist(@PathVariable Long userId) {
        WishlistResponse response = wishlistService.getWishlistByUserId(userId);
        return ResponseEntity.ok(response);
    }

    // Add product to user wishlist
    @PostMapping("/add")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        
        WishlistResponse response = wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.ok(response);
    }

    // Remove product from user wishlist
    @PostMapping("/remove")
    public ResponseEntity<WishlistResponse> removeFromWishlist(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        
        WishlistResponse response = wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(response);
    }
}
