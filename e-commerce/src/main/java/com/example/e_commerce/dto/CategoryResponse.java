package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO carrying category details returned to the frontend.
 */
@Getter
@Setter
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
}
