package com.example.e_commerce.security;

import com.example.e_commerce.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * This class wraps our database User object to provide security details to Spring Security.
 */
public class CustomUserDetails implements UserDetails {

    // Holds our database User entity
    private final User user;

    // Constructor to initialize user
    public CustomUserDetails(User user) {
        this.user = user;
    }

    // Returns the database User object
    public User getUser() {
        return user;
    }

    // Returns user authorities mapped from roles (e.g. ROLE_USER or ROLE_ADMIN)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String roleName = user.getRole();
        // Standardize format to ROLE_ prefix
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    // Returns user's password for security check
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    // Returns user's email as username
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    // Indicates whether the user's account has expired (always returns true/active)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // Indicates whether the user is locked or blocked (returns false if blocked is true)
    @Override
    public boolean isAccountNonLocked() {
        return true; 
    }

    // Indicates whether the user's credentials have expired (always returns true/active)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // Indicates whether the user is enabled (always returns true)
    @Override
    public boolean isEnabled() {
        return true;
    }
}
