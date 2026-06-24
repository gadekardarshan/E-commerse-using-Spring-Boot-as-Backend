package com.example.e_commerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO containing order placement details like user identifier and shipping destination.
 */
@Getter
@Setter
public class OrderRequest {

    private Long userId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Phone number is required")
    private String phone;
}
