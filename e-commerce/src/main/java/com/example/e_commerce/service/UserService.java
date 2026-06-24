package com.example.e_commerce.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.e_commerce.dto.LoginRequest;
import com.example.e_commerce.dto.RegisterRequest;
import com.example.e_commerce.dto.UserResponse;
import com.example.e_commerce.dto.UpdateProfileRequest;
import com.example.e_commerce.dto.ChangePasswordRequest;
import com.example.e_commerce.model.User;
import com.example.e_commerce.repository.UserRepository;
import com.example.e_commerce.security.JwtTokenProvider;
import com.example.e_commerce.exception.UserNotFoundException;

import java.util.List;

/**
 * UserService class managing registration, authentication, profile adjustments, and admin controls.
 */
@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Registers a new user, hashes their password, and saves them
    public UserResponse register(RegisterRequest request) {
        // Check if email is already taken
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Hash password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        User savedUser = userRepo.save(user);

        UserResponse response = modelMapper.map(savedUser, UserResponse.class);
        // Generate JWT token for immediate login after signup
        response.setToken(jwtTokenProvider.generateToken(savedUser.getEmail()));
        return response;
    }

    // Creates a new admin user directly (Admin function)
    public UserResponse createAdmin(RegisterRequest request) {
        // Check if email is already taken
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");

        User savedUser = userRepo.save(user);
        return modelMapper.map(savedUser, UserResponse.class);
    }

    // Authenticates credentials and returns user details with a JWT token
    public UserResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        // Check if user is blocked
        if (user.isBlocked()) {
            throw new RuntimeException("Your account is blocked. Please contact support.");
        }

        // Compare raw password with hashed password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        UserResponse response = modelMapper.map(user, UserResponse.class);
        // Generate token and assign to response
        response.setToken(jwtTokenProvider.generateToken(user.getEmail()));
        return response;
    }

    // Retrieves user details by ID
    public UserResponse getProfile(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return modelMapper.map(user, UserResponse.class);
    }

    // Updates name and email details of a user
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Check if email is being changed and is already taken
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && 
                userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already taken by another user");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        User updatedUser = userRepo.save(user);
        
        UserResponse response = modelMapper.map(updatedUser, UserResponse.class);
        response.setToken(jwtTokenProvider.generateToken(updatedUser.getEmail()));
        return response;
    }

    // Changes the password of an authenticated user after verification
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }

        // Save newly encoded password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
    }

    // Retrieves all registered users (Admin only)
    public List<UserResponse> getAllUsers() {
        return userRepo.findAll().stream()
                .map(user -> modelMapper.map(user, UserResponse.class))
                .toList();
    }

    // Changes user role between USER and ADMIN (Admin only)
    public UserResponse changeRole(Long id, String role) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        user.setRole(role.toUpperCase());
        User updatedUser = userRepo.save(user);
        return modelMapper.map(updatedUser, UserResponse.class);
    }

    // Blocks or unblocks a user (Admin only)
    public UserResponse toggleBlock(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        user.setBlocked(!user.isBlocked());
        User updatedUser = userRepo.save(user);
        return modelMapper.map(updatedUser, UserResponse.class);
    }

    // Deletes user from database (Admin only)
    public void deleteUser(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        userRepo.delete(user);
    }
}
