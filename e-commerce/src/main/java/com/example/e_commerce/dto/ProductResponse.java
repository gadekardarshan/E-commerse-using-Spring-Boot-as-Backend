package com.example.e_commerce.dto;

import lombok.Data;

/**
 * DTO carrying product details returned to the customer and admin screens.
 */
@Data
public class ProductResponse {

    private Long id;
    private String title;
    private Double price;
    private String description;
    private String category;
    private Long categoryId;
    private String image;
    private Integer stock;
    private Double rate;
    private Integer count;
}
