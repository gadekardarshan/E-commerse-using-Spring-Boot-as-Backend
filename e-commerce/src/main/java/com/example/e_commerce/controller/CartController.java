package com.example.e_commerce.controller;

import org.springframework.web.bind.annotation.*;

import com.example.e_commerce.dto.AddToCartRequest;
import com.example.e_commerce.dto.CartResponse;
import com.example.e_commerce.service.CartService;
import org.springframework.http.ResponseEntity;

/**
 * CartController managing customer shopping carts: view, add, adjust quantity, and delete.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }
   
    // Retrieves shopping cart items and details for a specific customer
    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userId) {
        CartResponse response = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(response);
    }
      
    // Adds a product to the shopping cart
    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(
                request.getUserId(),
                request.getProductId(),
                request.getQuantity());
        return ResponseEntity.ok(response);
    }

    // Updates quantity of a product in the cart
    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateQuantity(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam int quantity) {
        
        CartResponse response = cartService.updateQuantity(userId, productId, quantity);
        return ResponseEntity.ok(response);
    }

    // Removes a product from the shopping cart
    @DeleteMapping("/remove")
    public ResponseEntity<CartResponse> removeFromCart(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        
        CartResponse response = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(response);
    }

    // Clears the shopping cart entirely
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<String> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared successfully");
    }
}
