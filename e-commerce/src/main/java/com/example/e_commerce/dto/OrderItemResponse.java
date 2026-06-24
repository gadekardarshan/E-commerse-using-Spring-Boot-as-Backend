package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO showing details of an item bought within an order.
 */
@Getter
@Setter
public class OrderItemResponse {

    private Long productId;
    private String title;
    private Double price;
    private Integer quantity;
    private String image;
}
