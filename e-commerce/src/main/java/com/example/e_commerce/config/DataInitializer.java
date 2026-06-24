package com.example.e_commerce.config;

import com.example.e_commerce.model.User;
import com.example.e_commerce.repository.UserRepository;
import com.example.e_commerce.service.ProductService;
import com.example.e_commerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer class running on application startup, seeding default admin credentials and catalog items.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Seeds default Admin user and catalog products if database is empty
    @Override
    public void run(String... args) throws Exception {
        // Seed super admin user
        String adminEmail = "Admin@gmail.com";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            System.out.println(">>> Seeding default Admin user: Darshan (" + adminEmail + ")...");
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@1234"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println(">>> Default Admin user seeded successfully.");
        }

        // Seed catalog products
        long productCount = productRepository.count();
        if (productCount == 0) {
            System.out.println(">>> Database catalog is empty! Seeding categories and products from FakeStore API...");
            try {
                productService.fetchAndSaveProducts();
                System.out.println(">>> Database seeded successfully with products and categories.");
            } catch (Exception e) {
                System.err.println(">>> Failed to seed database from FakeStore API: " + e.getMessage());
            }
        } else {
            System.out.println(">>> Database already contains " + productCount + " products. Skipping seeding.");
        }
    }
}
