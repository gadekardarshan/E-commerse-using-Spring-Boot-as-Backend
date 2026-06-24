package com.example.e_commerce.repository;

import com.example.e_commerce.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * OrderRepository interface managing order data queries.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Retrieve order list for a specific customer, sorted latest first
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Retrieve all customer orders sorted latest first
    List<Order> findAllByOrderByOrderDateDesc();
}
