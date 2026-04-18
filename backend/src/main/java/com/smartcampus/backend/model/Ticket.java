package com.smartcampus.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Resource resource;

    @ManyToOne(optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "notifications"})
    private User creator;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "notifications"})
    private User technician; // Optional until assigned

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    private String category; // e.g. "FURNITURE", "IT_EQUIPMENT", "PLUMBING"

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotBlank(message = "Priority is required")
    @Column(nullable = false)
    private String priority; // "LOW", "MEDIUM", "HIGH"

    @NotBlank(message = "Contact details are required")
    @Column(nullable = false, length = 200)
    private String contactDetails;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private String resolutionNotes;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Ticket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public User getTechnician() { return technician; }
    public void setTechnician(User technician) { this.technician = technician; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }
    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
