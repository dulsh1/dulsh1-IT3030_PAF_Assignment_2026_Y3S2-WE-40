package com.smartcampus.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "notifications", "password"})
    private User user;

    private String message;
    
    private String type; // e.g., INFO, SUCCESS, WARNING
    
    private boolean isRead = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
