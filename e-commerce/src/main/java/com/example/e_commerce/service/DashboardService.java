package com.example.e_commerce.service;

import com.example.e_commerce.dto.AdminDashboardStats;
import com.example.e_commerce.dto.OrderItemResponse;
import com.example.e_commerce.dto.OrderResponse;
import com.example.e_commerce.dto.ProductResponse;
import com.example.e_commerce.model.Order;
import com.example.e_commerce.model.OrderItem;
import com.example.e_commerce.model.Product;
import com.example.e_commerce.repository.OrderRepository;
import com.example.e_commerce.repository.ProductRepository;
import com.example.e_commerce.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * DashboardService class compiling E-Commerce metadata for admin dashboards (revenue, top sellers, order summaries).
 */
@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ModelMapper modelMapper;

    // Compiles stats counts, total revenue, recent orders, and top products
    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        AdminDashboardStats stats = new AdminDashboardStats();

        // 1. Total counts
        stats.setTotalUsers(userRepository.count());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());

        // 2. Load all orders to calculate revenue and top-selling products
        List<Order> allOrders = orderRepository.findAllByOrderByOrderDateDesc();

        // Filter out cancelled orders for revenue
        double totalRevenue = allOrders.stream()
                .filter(o -> !o.getStatus().equalsIgnoreCase("CANCELLED"))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        // Round to 2 decimal places
        stats.setTotalRevenue(Math.round(totalRevenue * 100.0) / 100.0);

        // 3. Map recent orders (limit to 5)
        List<OrderResponse> recentOrders = allOrders.stream()
                .limit(5)
                .map(this::mapToOrderResponse)
                .toList();
        stats.setRecentOrders(recentOrders);

        // 4. Calculate top-selling products (limit to 5)
        Map<Product, Integer> productSales = new HashMap<>();
        for (Order order : allOrders) {
            if (!order.getStatus().equalsIgnoreCase("CANCELLED")) {
                for (OrderItem item : order.getItems()) {
                    Product prod = item.getProduct();
                    productSales.put(prod, productSales.getOrDefault(prod, 0) + item.getQuantity());
                }
            }
        }

        List<ProductResponse> topSellingProducts = productSales.entrySet().stream()
                .sorted((entry1, entry2) -> Integer.compare(entry2.getValue(), entry1.getValue()))
                .limit(5)
                .map(entry -> mapToProductResponse(entry.getKey()))
                .collect(Collectors.toList());
        stats.setTopSellingProducts(topSellingProducts);

        return stats;
    }

    // Helper method mapping Order to OrderResponse DTO
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setShippingAddress(order.getShippingAddress());
        response.setPhone(order.getPhone());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());

        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse dto = new OrderItemResponse();
            dto.setProductId(item.getProduct().getId());
            dto.setTitle(item.getProduct().getTitle());
            dto.setPrice(item.getPrice());
            dto.setQuantity(item.getQuantity());
            dto.setImage(item.getProduct().getImage());
            return dto;
        }).toList();

        response.setItems(itemResponses);
        return response;
    }

    // Helper method mapping Product to ProductResponse DTO
    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        if (product.getCategory() != null) {
            response.setCategory(product.getCategory().getName());
            response.setCategoryId(product.getCategory().getId());
        }
        if (product.getRating() != null) {
            response.setRate(product.getRating().getRate());
            response.setCount(product.getRating().getCount());
        } else {
            response.setRate(0.0);
            response.setCount(0);
        }
        return response;
    }
}
