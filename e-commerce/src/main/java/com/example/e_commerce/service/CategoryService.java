package com.example.e_commerce.service;

import com.example.e_commerce.dto.CategoryRequest;
import com.example.e_commerce.dto.CategoryResponse;
import com.example.e_commerce.model.Category;
import com.example.e_commerce.repository.CategoryRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * CategoryService class managing category retrieval and admin category creation, edits, and deletions.
 */
@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Retrieves all categories from the database
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(category -> modelMapper.map(category, CategoryResponse.class))
                .toList();
    }

    // Retrieves a single category by ID
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        return modelMapper.map(category, CategoryResponse.class);
    }

    // Creates a new category (Admin function)
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Enforce unique category names
        if (categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryResponse.class);
    }

    // Updates an existing category's fields (Admin function)
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        // Enforce unique names when changing name
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()) {
            throw new RuntimeException("Category name is already taken");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);
        return modelMapper.map(updatedCategory, CategoryResponse.class);
    }

    // Deletes category from database (Admin function)
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        categoryRepository.delete(category);
    }
}
