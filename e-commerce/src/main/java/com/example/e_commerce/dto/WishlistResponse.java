package com.example.e_commerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * DTO carrying the list of products currently saved in user's wishlist.
 */
@Getter
@Setter
public class WishlistResponse {

    private Long id;
    private Long userId;
    private List<ProductResponse> products;
}
