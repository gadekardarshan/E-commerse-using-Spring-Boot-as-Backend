package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO compiling statistics for the Admin Dashboard screen, including counts, revenue, and list data.
 */
@Getter
@Setter
public class AdminDashboardStats {

    private Long totalUsers;
    private Long totalOrders;
    private Long totalProducts;
    private Double totalRevenue;
    private List<OrderResponse> recentOrders;
    private List<ProductResponse> topSellingProducts;
}
