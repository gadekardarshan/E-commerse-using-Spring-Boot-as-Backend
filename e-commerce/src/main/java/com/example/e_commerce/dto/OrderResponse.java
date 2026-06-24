package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO detailing order properties including order date, status, total cost, and items list.
 */
@Getter
@Setter
public class OrderResponse {

    private Long id;
    private Long userId;
    private Double totalAmount;
    private String shippingAddress;
    private String phone;
    private String status;
    private LocalDateTime orderDate;
    private List<OrderItemResponse> items;
}
