package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO detailing review properties returned to client, showing name of reviewer and date written.
 */
@Getter
@Setter
public class ReviewResponse {

    private Long id;
    private String userName;
    private Long productId;
    private Double rating;
    private String comment;
    private LocalDateTime createdAt;
}
