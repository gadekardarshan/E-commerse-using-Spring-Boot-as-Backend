package com.example.e_commerce.security;

import com.example.e_commerce.model.User;
import com.example.e_commerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * This service class is used by Spring Security to load a user's details using their email address.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    // Inject UserRepository to search for the user in the database
    @Autowired
    private UserRepository userRepository;

    // Loads a user by their email address and wraps it in a CustomUserDetails object
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return new CustomUserDetails(user);
    }
}
