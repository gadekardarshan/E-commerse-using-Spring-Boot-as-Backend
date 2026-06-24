package com.example.e_commerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.e_commerce.dto.LoginRequest;
import com.example.e_commerce.dto.RegisterRequest;
import com.example.e_commerce.dto.UserResponse;
import com.example.e_commerce.service.UserService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * AuthController class managing public user signups and logins.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // A simple endpoint to test if auth controller is active
    @GetMapping("/test")
    public String test() {
        return "Auth API Working";
    }

    // Handles user registration, validates credentials, and returns registered details with token
    @PostMapping("/register")
    public ResponseEntity<UserResponse> postRegister(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    // Handles user login, verifies credentials, and returns user details with token
    @PostMapping("/login")
    public ResponseEntity<UserResponse> postLogin(@Valid @RequestBody LoginRequest request) {
        UserResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}
