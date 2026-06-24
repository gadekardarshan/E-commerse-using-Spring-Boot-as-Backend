package com.example.e_commerce.controller;

import com.example.e_commerce.dto.OrderRequest;
import com.example.e_commerce.dto.OrderResponse;
import com.example.e_commerce.security.CustomUserDetails;
import com.example.e_commerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OrderController managing checkout, order histories, and admin order fulfillment controls.
 */
@RestController
@RequestMapping
public class OrderController {

    @Autowired
    private OrderService orderService;

    // --- CUSTOMER APIS ---

    // Place a new order using items in shopping cart and shipping details
    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.ok(response);
    }

    // Fetch order history for current customer
    @GetMapping("/api/orders/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@PathVariable Long userId) {
        List<OrderResponse> response = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(response);
    }

    // Fetch single order details
    @GetMapping("/api/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    // Cancel own order (only permitted if order status is still PLACED)
    @PutMapping("/api/orders/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id, 
            @RequestParam Long userId) {
        
        OrderResponse response = orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(response);
    }

    // --- ADMIN APIS (Prefix "/admin/") ---

    // Admin endpoint: List all orders made by all customers
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> response = orderService.getAllOrders();
        return ResponseEntity.ok(response);
    }

    // Admin endpoint: Transition order status (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        
        OrderResponse response = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(response);
    }
}
