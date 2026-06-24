package com.example.e_commerce.service;

import com.example.e_commerce.dto.ProductResponse;
import com.example.e_commerce.dto.WishlistResponse;
import com.example.e_commerce.model.Product;
import com.example.e_commerce.model.User;
import com.example.e_commerce.model.Wishlist;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UserRepository;
import com.example.e_commerce.repository.WishlistRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

/**
 * WishlistService class managing bookmarking products in a customer's wishlist.
 */
@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Retrieves or creates user wishlist
    @Transactional
    public WishlistResponse getWishlistByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUser(user);
                    newWishlist.setProducts(new HashSet<>());
                    return wishlistRepository.save(newWishlist);
                });

        return mapToResponse(wishlist);
    }

    // Adds a product to user wishlist
    @Transactional
    public WishlistResponse addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));

        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUser(user);
                    newWishlist.setProducts(new HashSet<>());
                    return newWishlist;
                });

        wishlist.getProducts().add(product);
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return mapToResponse(savedWishlist);
    }

    // Removes a product from user wishlist
    @Transactional
    public WishlistResponse removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found for user: " + userId));

        wishlist.getProducts().removeIf(product -> product.getId().equals(productId));
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        return mapToResponse(savedWishlist);
    }

    // Helper method mapping Wishlist entity to WishlistResponse DTO
    private WishlistResponse mapToResponse(Wishlist wishlist) {
        WishlistResponse response = new WishlistResponse();
        response.setId(wishlist.getId());
        response.setUserId(wishlist.getUser().getId());

        List<ProductResponse> products = wishlist.getProducts().stream().map(product -> {
            ProductResponse pr = modelMapper.map(product, ProductResponse.class);
            if (product.getCategory() != null) {
                pr.setCategory(product.getCategory().getName());
                pr.setCategoryId(product.getCategory().getId());
            }
            if (product.getRating() != null) {
                pr.setRate(product.getRating().getRate());
                pr.setCount(product.getRating().getCount());
            }
            return pr;
        }).toList();

        response.setProducts(products);
        return response;
    }
}
