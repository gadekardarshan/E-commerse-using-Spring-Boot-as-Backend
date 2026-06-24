package com.example.e_commerce.service;

import com.example.e_commerce.model.*;
import com.example.e_commerce.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.e_commerce.dto.CartResponse;
import com.example.e_commerce.dto.CartItemResponse;
import com.example.e_commerce.exception.ProductNotFoundException;
import com.example.e_commerce.exception.UserNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * CartService class managing customer shopping cart operations: add, quantity updates, removal, and checkout clear.
 */
@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Adds a product to user's cart (or creates a cart if not exists)
    @Transactional
    public CartResponse addToCart(Long userId, Long productId, int quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            cart.getItems().add(item);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToResponse(savedCart);
    }

    // Fetches user's cart, throwing exception if user has no cart initialized
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));
        return mapToResponse(cart);
    }

    // Updates quantity of a specific product in a user's cart
    @Transactional
    public CartResponse updateQuantity(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToResponse(savedCart);
    }

    // Removes a product from a user's cart
    @Transactional
    public CartResponse removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        Cart savedCart = cartRepository.save(cart);
        return mapToResponse(savedCart);
    }

    // Clears all items in a user's cart
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    // Helper method mapping a Cart entity to a CartResponse DTO
    private CartResponse mapToResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUser().getId());

        List<CartItemResponse> itemResponses = cart.getItems()
                .stream()
                .map(item -> {
                    CartItemResponse dto = new CartItemResponse();
                    dto.setProductId(item.getProduct().getId());
                    dto.setTitle(item.getProduct().getTitle());
                    dto.setPrice(item.getProduct().getPrice());
                    dto.setQuantity(item.getQuantity());
                    dto.setImage(item.getProduct().getImage());
                    return dto;
                })
                .toList();

        response.setItems(itemResponses);
        return response;
    }
}