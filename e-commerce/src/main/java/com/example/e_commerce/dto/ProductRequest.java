package com.example.e_commerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO carrying product details for creation and modification by admin users.
 */
@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Product title is required")
    private String title;

    @NotNull(message = "Product price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double price;

    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String image;

    @Min(value = 0, message = "Stock count cannot be negative")
    private Integer stock = 100;
}
