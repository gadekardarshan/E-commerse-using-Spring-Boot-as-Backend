package com.example.e_commerce.repository;

import com.example.e_commerce.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CategoryRepository interface supporting CRUD operations and category lookup by name.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Retrieve category record by its exact name
    Optional<Category> findByNameIgnoreCase(String name);
}
