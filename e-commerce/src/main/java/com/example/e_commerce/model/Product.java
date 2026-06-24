package com.example.e_commerce.model;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Product entity mapping products, linked to a Category with dynamic stock and rating details.
 */
@Data
@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Many products belong to one Category
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    private String image;

    // Default stock count of 100 units
    private Integer stock = 100;

    @Embedded
    private Rating rating;
}
