package com.example.e_commerce.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Rating {

    private Double rate;

    private Integer count;
    
}
