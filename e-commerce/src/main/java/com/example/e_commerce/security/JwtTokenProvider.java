package com.example.e_commerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * This helper class generates, reads, and validates JSON Web Tokens (JWT) for user authentication.
 */
@Component
public class JwtTokenProvider {

    // A secure secret key string that must be at least 256 bits long
    private final String secretString = "eCommerceSecretKeyForJwtTokenGenerationAndValidationWhichMustBeLongEnough";
    
    // Generate the cryptographic key from the secret string
    private final SecretKey key = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));

    // Token validity duration set to 24 hours (in milliseconds)
    private final long tokenValidityInMilliseconds = 24 * 60 * 60 * 1000L;

    // Generates a JWT token using the user's email address
    public String generateToken(String email) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(validity)
                .signWith(key)
                .compact();
    }

    // Extracts the user's email (subject) from a given JWT token
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    // Validates if the token is formatted correctly and has not expired
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Token is invalid or expired
            return false;
        }
    }
}
