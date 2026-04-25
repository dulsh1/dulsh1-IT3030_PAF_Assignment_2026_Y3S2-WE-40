package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Booking Management REST Controller
 * Member: Anne (IT2345599) — Module B
 *
 * Endpoints:
 *   GET    /api/bookings                    — Admin: view all bookings
 *   GET    /api/bookings/{id}               — Get single booking by ID
 *   GET    /api/bookings/user/{userId}      — User: view own bookings
 *   POST   /api/bookings                    — Create booking request (conflict-checked)
 *   PUT    /api/bookings/{id}/status        — Admin: approve / reject booking
 *   DELETE /api/bookings/{id}/cancel        — User: cancel own booking
 */
@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // GET /api/bookings — Admin: all bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/{id} — Single booking detail
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(bookingService.getBookingById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/bookings/user/{userId} — User's own bookings
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    // POST /api/bookings — Create a new booking request
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = ((Number) payload.get("userId")).longValue();
            Long resourceId = ((Number) payload.get("resourceId")).longValue();
            LocalDateTime start = LocalDateTime.parse((String) payload.get("startTime"));
            LocalDateTime end = LocalDateTime.parse((String) payload.get("endTime"));
            String purpose = (String) payload.get("purpose");

            if (purpose == null || purpose.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Purpose of booking is required"));
            }
            if (end.isBefore(start) || end.isEqual(start)) {
                return ResponseEntity.badRequest().body(Map.of("message", "End time must be after start time"));
            }

            Booking booking = bookingService.createBookingRequest(userId, resourceId, start, end, purpose);
            return ResponseEntity.status(201).body(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/bookings/{id}/status — Admin: approve or reject
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            BookingStatus status = BookingStatus.valueOf(payload.get("status"));
            String reason = payload.get("rejectionReason");
            Booking updated = bookingService.updateBookingStatus(id, status, reason);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/bookings/{id}/cancel — User: cancel own booking
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable("id") Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = ((Number) payload.get("userId")).longValue();
            bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
