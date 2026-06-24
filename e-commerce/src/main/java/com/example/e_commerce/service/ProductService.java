package com.example.e_commerce.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.e_commerce.dto.ProductRequest;
import com.example.e_commerce.dto.ProductResponse;
import com.example.e_commerce.model.Category;
import com.example.e_commerce.model.Product;
import com.example.e_commerce.model.Rating;
import com.example.e_commerce.exception.ProductNotFoundException;
import com.example.e_commerce.repository.CategoryRepository;
import com.example.e_commerce.repository.ProductRepository;

import lombok.Data;

/**
 * ProductService class managing product storage, search filtering, category associations, and FakeStore synchronization.
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private RestTemplate restTemplate;

    // Helper static class to parse FakeStore API products safely without mapping type errors
    @Data
    public static class FakeStoreProduct {
        private Long id;
        private String title;
        private Double price;
        private String description;
        private String category;
        private String image;
        private Rating rating;
    }

    // Fetches products from FakeStore API, extracts/creates Categories, and stores products in the H2 database
    @Transactional
    public List<ProductResponse> fetchAndSaveProducts() {
        FakeStoreProduct[] products = restTemplate.getForObject(
                "https://fakestoreapi.com/products",
                FakeStoreProduct[].class);

        if (products == null) {
            return List.of();
        }

        List<Product> savedProducts = Arrays.stream(products).map(fsp -> {
            // Find or create Category
            Category category = categoryRepository.findByNameIgnoreCase(fsp.getCategory())
                    .orElseGet(() -> {
                        Category newCategory = new Category(fsp.getCategory());
                        newCategory.setDescription(fsp.getCategory() + " category.");
                        return categoryRepository.save(newCategory);
                    });

            // Create and populate Product
            Product product = new Product();
            product.setTitle(fsp.getTitle());
            product.setPrice(fsp.getPrice());
            product.setDescription(fsp.getDescription());
            product.setCategory(category);
            product.setImage(fsp.getImage());
            product.setStock(100); // Seed default stock of 100
            
            // Set rating
            if (fsp.getRating() != null) {
                product.setRating(fsp.getRating());
            } else {
                Rating emptyRating = new Rating();
                emptyRating.setRate(0.0);
                emptyRating.setCount(0);
                product.setRating(emptyRating);
            }

            return product;
        }).collect(Collectors.toList());

        productRepository.saveAll(savedProducts);

        return savedProducts.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Gets all products with optional search query, category filtering, and price sorting
    public List<ProductResponse> getAllProducts(String search, Long categoryId, String sortBy) {
        List<Product> products;

        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search);
        } else {
            products = productRepository.findAll();
        }

        // Filter by category
        if (categoryId != null) {
            products = products.stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(categoryId))
                    .collect(Collectors.toList());
        }

        // Apply price sorting
        if (sortBy != null) {
            if (sortBy.equalsIgnoreCase("price_asc")) {
                products.sort((p1, p2) -> Double.compare(p1.getPrice(), p2.getPrice()));
            } else if (sortBy.equalsIgnoreCase("price_desc")) {
                products.sort((p1, p2) -> Double.compare(p2.getPrice(), p1.getPrice()));
            } else if (sortBy.equalsIgnoreCase("rating")) {
                products.sort((p1, p2) -> {
                    Double r1 = (p1.getRating() != null) ? p1.getRating().getRate() : 0.0;
                    Double r2 = (p2.getRating() != null) ? p2.getRating().getRate() : 0.0;
                    return Double.compare(r2, r1);
                });
            }
        }

        return products.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieves products present in database directly without sync
    public List<ProductResponse> getAllProductsFromDb() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Finds a product by ID, throwing Exception if not found
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    // Creates a new product (Admin function)
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setTitle(request.getTitle());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setImage(request.getImage() != null ? request.getImage() : "https://via.placeholder.com/150");
        product.setStock(request.getStock());

        Rating emptyRating = new Rating();
        emptyRating.setRate(0.0);
        emptyRating.setCount(0);
        product.setRating(emptyRating);

        Product savedProduct = productRepository.save(product);
        return mapToResponse(savedProduct);
    }

    // Updates an existing product's fields (Admin function)
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));

        product.setTitle(request.getTitle());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        if (request.getImage() != null) {
            product.setImage(request.getImage());
        }
        product.setStock(request.getStock());

        Product updatedProduct = productRepository.save(product);
        return mapToResponse(updatedProduct);
    }

    // Deletes product from the database (Admin function)
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    // Maps a Product entity to a ProductResponse DTO safely
    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        if (product.getCategory() != null) {
            response.setCategory(product.getCategory().getName());
            response.setCategoryId(product.getCategory().getId());
        }
        if (product.getRating() != null) {
            response.setRate(product.getRating().getRate());
            response.setCount(product.getRating().getCount());
        } else {
            response.setRate(0.0);
            response.setCount(0);
        }
        return response;
    }
}
