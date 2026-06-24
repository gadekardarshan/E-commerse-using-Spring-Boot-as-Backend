package com.example.e_commerce.controller;

import com.example.e_commerce.dto.AdminDashboardStats;
import com.example.e_commerce.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AdminDashboardController compiling stats for the premium Admin Dashboard interface.
 */
@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private DashboardService dashboardService;

    // Fetch dashboard total figures, charts list, recent orders, and top sales products
    @GetMapping
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        AdminDashboardStats stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
