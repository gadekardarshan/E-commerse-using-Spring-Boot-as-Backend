package com.example.e_commerce.dto;

import java.util.List;

import lombok.Data;

@Data
public class CartResponse {

    private Long id;

    private Long userId;

    private List<CartItemResponse> items;
    
}
