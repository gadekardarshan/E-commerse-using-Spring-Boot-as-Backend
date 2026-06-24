package com.example.e_commerce.service;

import com.example.e_commerce.dto.OrderItemResponse;
import com.example.e_commerce.dto.OrderRequest;
import com.example.e_commerce.dto.OrderResponse;
import com.example.e_commerce.model.*;
import com.example.e_commerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * OrderService class handling order placements, stock adjustments, customer orders query, and status progressions.
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    // Places a new order from user's shopping cart, reducing product stock counts
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));

        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Shopping cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order: Shopping cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setPhone(request.getPhone());
        order.setStatus("PLACED");

        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            // Check stock availability
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getTitle() + " (Available: " + product.getStock() + ")");
            }

            // Deduct stock count
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            // Construct OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            
            orderItems.add(orderItem);
            totalAmount += product.getPrice() * cartItem.getQuantity();
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Empty user's shopping cart after placing order
        cartService.clearCart(user.getId());

        return mapToResponse(savedOrder);
    }

    // Fetches own orders list for a customer, newest first
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Retrieves specific order details by ID
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
        return mapToResponse(order);
    }

    // Cancels customer order if not shipped yet, returning items to stock
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        // Security check
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this order");
        }

        // Only allow cancellation on PLACED orders
        if (!order.getStatus().equalsIgnoreCase("PLACED")) {
            throw new RuntimeException("Cannot cancel order: Order status is already " + order.getStatus());
        }

        order.setStatus("CANCELLED");

        // Refund product stocks
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    // Retrieves all customer orders (Admin function)
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Updates order delivery progress status (Admin function)
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        String oldStatus = order.getStatus();
        String newStatus = status.toUpperCase();

        if (oldStatus.equalsIgnoreCase("CANCELLED") || oldStatus.equalsIgnoreCase("DELIVERED")) {
            throw new RuntimeException("Cannot change status: Order is already " + oldStatus);
        }

        order.setStatus(newStatus);

        // Refund stock if order is cancelled by admin
        if (newStatus.equalsIgnoreCase("CANCELLED") && !oldStatus.equalsIgnoreCase("CANCELLED")) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    // Helper method mapping Order entity to OrderResponse DTO
    private OrderResponse mapToResponse(Order order) {
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
}
