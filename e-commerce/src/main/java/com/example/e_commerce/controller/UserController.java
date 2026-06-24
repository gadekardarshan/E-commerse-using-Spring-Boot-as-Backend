package com.example.e_commerce.controller;

import com.example.e_commerce.dto.ChangePasswordRequest;
import com.example.e_commerce.dto.UpdateProfileRequest;
import com.example.e_commerce.dto.UserResponse;
import com.example.e_commerce.dto.RegisterRequest;
import com.example.e_commerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UserController managing profile queries, profile updates, and admin user status controls.
 */
@RestController
@RequestMapping
public class UserController {

    @Autowired
    private UserService userService;

    // --- CUSTOMER PROFILE APIS ---

    // Fetch user details for profile screen
    @GetMapping("/api/users/profile/{id}")
    public ResponseEntity<UserResponse> getProfile(@PathVariable Long id) {
        UserResponse response = userService.getProfile(id);
        return ResponseEntity.ok(response);
    }

    // Update name or email for profile screen
    @PutMapping("/api/users/profile/{id}")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateProfileRequest request) {
        
        UserResponse response = userService.updateProfile(id, request);
        return ResponseEntity.ok(response);
    }

    // Change account password (verifying current password first)
    @PutMapping("/api/users/profile/{id}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id, 
            @Valid @RequestBody ChangePasswordRequest request) {
        
        userService.changePassword(id, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    // --- ADMIN APIS (Prefix "/admin/") ---

    // Admin endpoint: Manually create a new admin user
    @PostMapping("/admin/users")
    public ResponseEntity<UserResponse> createAdmin(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.createAdmin(request);
        return ResponseEntity.ok(response);
    }

    // Admin endpoint: List all registered users
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Admin endpoint: Swap user role between USER and ADMIN
    @PutMapping("/admin/users/{id}/role")
    public ResponseEntity<UserResponse> changeRole(
            @PathVariable Long id, 
            @RequestParam String role) {
        
        UserResponse response = userService.changeRole(id, role);
        return ResponseEntity.ok(response);
    }

    // Admin endpoint: Block or unblock a user's account access
    @PutMapping("/admin/users/{id}/block")
    public ResponseEntity<UserResponse> toggleBlock(@PathVariable Long id) {
        UserResponse response = userService.toggleBlock(id);
        return ResponseEntity.ok(response);
    }

    // Admin endpoint: Permanently delete a user
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
