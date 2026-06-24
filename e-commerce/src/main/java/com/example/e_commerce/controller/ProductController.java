package com.example.e_commerce.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.e_commerce.dto.ProductRequest;
import com.example.e_commerce.dto.ProductResponse;
import com.example.e_commerce.service.ProductService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

/**
 * ProductController managing both public product catalog searches and admin product CRUD operations.
 */
@RestController
@RequestMapping
public class ProductController {

    @Autowired
    private ProductService productService;

    // --- CUSTOMER APIS ---

    // Public endpoint: Fetch products list with optional search keywords, category filter, and sorting options
    @GetMapping("/api/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortBy) {
        
        List<ProductResponse> products = productService.getAllProducts(search, categoryId, sortBy);
        return ResponseEntity.ok(products);
    }

    // Public endpoint: Fetch details of a single product by ID
    @GetMapping("/api/products/{id:\\d+}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    // --- ADMIN APIS (Requires ADMIN role, prefix "/admin/") ---

    // Admin endpoint: Import mock categories and products from the FakeStore API
    @PostMapping("/admin/products/sync")
    public ResponseEntity<List<ProductResponse>> syncProducts() {
        List<ProductResponse> products = productService.fetchAndSaveProducts();
        return ResponseEntity.ok(products);
    }

    // Admin endpoint: Add a new product to the catalog
    @PostMapping("/admin/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(product);
    }

    // Admin endpoint: Update fields of an existing product
    @PutMapping("/admin/products/{id:\\d+}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductRequest request) {
        
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    // Admin endpoint: Delete a product from the database
    @DeleteMapping("/admin/products/{id:\\d+}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
