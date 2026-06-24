package com.example.e_commerce.repository;

import com.example.e_commerce.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * WishlistRepository interface managing custom wishlist retrieval.
 */
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // Fetch wishlist belonging to user ID
    Optional<Wishlist> findByUserId(Long userId);
}
