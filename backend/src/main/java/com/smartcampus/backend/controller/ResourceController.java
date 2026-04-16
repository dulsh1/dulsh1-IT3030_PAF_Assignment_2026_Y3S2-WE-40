package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Facilities & Assets Catalogue REST Controller
 *
 * Endpoints:
 *   GET    /api/resources                — List all resources (filterable by type, capacity)
 *   GET    /api/resources/{id}           — Get a single resource by ID
 *   GET    /api/resources/{id}/image     — Serve image for a resource (binary)
 *   POST   /api/resources               — Admin: create a new resource (multipart)
 *   PUT    /api/resources/{id}           — Admin: update resource details (multipart)
 *   DELETE /api/resources/{id}           — Admin: remove a resource from the catalogue
 */
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // GET /api/resources — List or filter resources; does NOT include binary image data
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "minCapacity", required = false) Integer minCapacity) {

        if (type != null || minCapacity != null) {
            return ResponseEntity.ok(resourceService.searchResources(type, minCapacity));
        }
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET /api/resources/{id} — Get single resource metadata
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // GET /api/resources/{id}/image — Serve the binary image separately so the list response stays small
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getResourceImage(@PathVariable("id") Long id) {
        Resource resource = resourceService.getResourceById(id);
        if (resource.getImage() == null || resource.getImage().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = resource.getImageContentType() != null
                ? resource.getImageContentType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource.getImage());
    }

    // POST /api/resources — Admin: create a resource
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Resource> createResource(
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("capacity") int capacity,
            @RequestParam("location") String location,
            @RequestParam("status") String status,
            @RequestParam(value = "startTime", required = false) String startTime,
            @RequestParam(value = "endTime", required = false) String endTime,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        if (name == null || name.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        if (capacity < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity cannot be negative");

        Resource created = resourceService.createResource(name, type, capacity, location, status, startTime, endTime, image);
        return ResponseEntity.status(201).body(created);
    }

    // PUT /api/resources/{id} — Admin: update an existing resource
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Resource> updateResource(
            @PathVariable("id") Long id,
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            @RequestParam("capacity") int capacity,
            @RequestParam("location") String location,
            @RequestParam("status") String status,
            @RequestParam(value = "startTime", required = false) String startTime,
            @RequestParam(value = "endTime", required = false) String endTime,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        return ResponseEntity.ok(resourceService.updateResourceMultipart(id, name, type, capacity, location, status, startTime, endTime, image));
    }

    // DELETE /api/resources/{id} — Admin: delete a resource
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable("id") Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
