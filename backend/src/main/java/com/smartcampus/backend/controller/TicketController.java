package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Maintenance & Incident Ticketing REST Controller
 * Member: Samantha (IT234576869) — Module C
 *
 * Endpoints:
 *   GET    /api/tickets                            — Admin: all tickets
 *   GET    /api/tickets/{id}                       — Get ticket by ID
 *   GET    /api/tickets/user/{userId}              — User's own tickets
 *   GET    /api/tickets/technician/{techId}        — Tickets assigned to a technician
 *   POST   /api/tickets                            — Create a new incident ticket
 *   PUT    /api/tickets/{id}/assign/{techId}       — Assign technician to ticket
 *   PUT    /api/tickets/{id}/status               — Update ticket status
 *   POST   /api/tickets/{id}/comments             — Add a comment
 *   GET    /api/tickets/{id}/comments             — Get all comments
 *   DELETE /api/tickets/comments/{commentId}/user/{userId} — Delete own comment
 *   POST   /api/tickets/{id}/attachments          — Upload image attachment (max 3)
 *   GET    /api/tickets/{id}/attachments          — List attachments for ticket
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByCreator(userId));
    }
    
    @GetMapping("/technician/{techId}")
    public ResponseEntity<List<Ticket>> getTechnicianTickets(@PathVariable("techId") Long techId) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(techId));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> payload) {
        try {
            Long creatorId = ((Number) payload.get("creatorId")).longValue();
            Long resourceId = ((Number) payload.get("resourceId")).longValue();
            String category = (String) payload.get("category");
            String description = (String) payload.get("description");
            String priority = (String) payload.get("priority");
            String contactDetails = (String) payload.get("contactDetails");

            if (description == null || description.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Description is required"));
            }
            if (contactDetails == null || contactDetails.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Contact details are required"));
            }

            Ticket ticket = ticketService.createTicket(creatorId, resourceId, category, description, priority, contactDetails);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/assign/{techId}")
    public ResponseEntity<?> assignTechnician(@PathVariable("id") Long id, @PathVariable("techId") Long techId) {
        try {
            return ResponseEntity.ok(ticketService.assignTechnician(id, techId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> payload) {
        try {
            TicketStatus status = TicketStatus.valueOf(payload.get("status"));
            String notes = payload.get("resolutionNotes");
            return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable("id") Long id, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = ((Number) payload.get("userId")).longValue();
            String content = (String) payload.get("content");
            return ResponseEntity.ok(ticketService.addComment(id, userId, content));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }
    
    @DeleteMapping("/comments/{commentId}/user/{userId}")
    public ResponseEntity<?> deleteComment(@PathVariable("commentId") Long commentId, @PathVariable("userId") Long userId) {
        try {
            ticketService.deleteComment(commentId, userId);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> uploadAttachment(@PathVariable("id") Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            return ResponseEntity.ok(ticketService.uploadAttachment(id, file));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<?> getAttachments(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ticketService.getAttachments(id));
    }
}
