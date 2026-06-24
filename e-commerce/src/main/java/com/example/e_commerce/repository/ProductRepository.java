package com.example.e_commerce.repository;

import com.example.e_commerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ProductRepository interface providing product persistence CRUD operations and custom search queries.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by category ID
    List<Product> findByCategoryId(Long categoryId);

    // Find products by category name (case-insensitive)
    List<Product> findByCategoryNameIgnoreCase(String categoryName);

    // Search products by name or description containing keywords (case-insensitive)
    List<Product> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titleQuery, String descriptionQuery);
}
