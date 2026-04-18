package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.Role;
import com.smartcampus.backend.model.TicketStatus;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.model.TicketAttachment;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.TicketAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private NotificationService notificationService;

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByCreator(Long userId) {
        return ticketRepository.findByCreatorId(userId);
    }
    
    public List<Ticket> getTicketsByTechnician(Long technicianId) {
        return ticketRepository.findByTechnicianId(technicianId);
    }

    public Ticket createTicket(Long creatorId, Long resourceId, String category, String description, String priority, String contactDetails) {
        Resource resource = resourceService.getResourceById(resourceId);
        Ticket ticket = new Ticket();
        
        User creator = new User();
        creator.setId(creatorId);
        
        ticket.setCreator(creator);
        ticket.setResource(resource);
        ticket.setCategory(category);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setContactDetails(contactDetails);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        
        Ticket saved = ticketRepository.save(ticket);
        
        // Notify Admins and Technicians
        notificationService.notifyUsersByRole(Role.ROLE_ADMIN, "New issue reported: " + category + " for " + resource.getName(), "WARNING");
        notificationService.notifyUsersByRole(Role.ROLE_TECHNICIAN, "New " + category + " ticket available at " + resource.getName(), "INFO");
        
        return saved;
    }

    public Ticket assignTechnician(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User tech = new User();
        tech.setId(technicianId);
        ticket.setTechnician(tech);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        
        if (ticket.getCreator() != null) {
            notificationService.createNotification(ticket.getCreator().getId(), "Your ticket #" + ticket.getId() + " has been picked up by a technician.", "INFO");
        }
        
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(Long ticketId, TicketStatus status, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus(status);
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        
        if (ticket.getCreator() != null) {
            notificationService.createNotification(ticket.getCreator().getId(), "Ticket #" + ticket.getId() + " status updated to " + status + ". Notes: " + (resolutionNotes != null ? resolutionNotes : "None"), "SUCCESS");
        }
        
        return ticketRepository.save(ticket);
    }

    public TicketComment addComment(Long ticketId, Long userId, String content) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        User user = new User();
        user.setId(userId);
        
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(content);
        TicketComment saved = commentRepository.save(comment);

        // Notify appropriate party
        if (ticket.getCreator() != null && !ticket.getCreator().getId().equals(userId)) {
            notificationService.createNotification(ticket.getCreator().getId(), "New comment on your ticket #" + ticket.getId(), "INFO");
        } else if (ticket.getTechnician() != null && !ticket.getTechnician().getId().equals(userId)) {
            notificationService.createNotification(ticket.getTechnician().getId(), "User commented on assigned ticket #" + ticket.getId(), "WARNING");
        }

        return saved;
    }
    
    public List<TicketComment> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }
    
    public void deleteComment(Long commentId, Long userId) {
        TicketComment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments.");
        }
        commentRepository.delete(comment);
    }
    
    public TicketAttachment uploadAttachment(Long ticketId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        List<TicketAttachment> existing = attachmentRepository.findByTicketId(ticketId);
        if (existing.size() >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket.");
        }
        
        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename()));
        attachment.setContentType(file.getContentType());
        attachment.setData(file.getBytes());
        
        return attachmentRepository.save(attachment);
    }
    
    public List<TicketAttachment> getAttachments(Long ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }
}
