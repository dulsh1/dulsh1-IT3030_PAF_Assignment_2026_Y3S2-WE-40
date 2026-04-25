package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Notifications REST Controller
 *
 * Endpoints:
 *   GET  /api/notifications/user/{userId}           — Get all notifications for a user
 *   GET  /api/notifications/user/{userId}/unread-count — Count of unread notifications
 *   PUT  /api/notifications/{id}/read               — Mark a single notification as read
 *   PUT  /api/notifications/user/{userId}/read-all  — Mark all user notifications as read
 *   POST /api/notifications/send                    — Admin: manually send a notification
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationService service;

    // GET /api/notifications/user/{userId} — Fetch all notifications (newest first)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getUserNotifications(userId));
    }

    // GET /api/notifications/user/{userId}/unread-count — Badge count for UI header
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        long count = service.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PUT /api/notifications/{id}/read — Mark a single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            service.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/notifications/user/{userId}/read-all — Mark all as read in one go
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        service.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // POST /api/notifications/send — Admin: manually push a notification
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(
            @RequestParam Long userId,
            @RequestParam String message,
            @RequestParam String type) {
        return ResponseEntity.ok(service.createNotification(userId, message, type));
    }
}
