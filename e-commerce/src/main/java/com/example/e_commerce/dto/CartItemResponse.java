package com.example.e_commerce.dto;

import lombok.Data;

@Data
public class CartItemResponse {

    private Long productId;

    private String title;

    private Double price;

    private Integer quantity;

    private String image;
}
