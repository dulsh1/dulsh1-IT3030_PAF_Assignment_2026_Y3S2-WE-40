package com.smartcampus.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String type;

    @Min(value = 0, message = "Capacity must be at least 0")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String availabilityWindows;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] image;

    private String imageContentType;

    private String startTime;
    private String endTime;

    @Column(nullable = false)
    private String status;

    public Resource() {
    }

    public Resource(String name, String type, int capacity, String location, String availabilityWindows, String status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindows = availabilityWindows;
        this.status = status;
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public int getCapacity() {
        return capacity;
    }
    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }
    public String getAvailabilityWindows() {
        return availabilityWindows;
    }
    public void setAvailabilityWindows(String availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public byte[] getImage() { return image; }
    public void setImage(byte[] image) { this.image = image; }
    public String getImageContentType() { return imageContentType; }
    public void setImageContentType(String imageContentType) { this.imageContentType = imageContentType; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
