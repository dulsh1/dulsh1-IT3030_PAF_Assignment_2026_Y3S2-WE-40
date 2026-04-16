package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Resource createResource(String name, String type, int capacity, String location, String status, String startTime, String endTime, org.springframework.web.multipart.MultipartFile image) {
        Resource r = new Resource();
        r.setName(name);
        r.setType(type);
        r.setCapacity(capacity);
        r.setLocation(location);
        r.setStatus(status);
        r.setStartTime(startTime);
        r.setEndTime(endTime);
        r.setAvailabilityWindows("Daily " + startTime + " to " + endTime);
        
        if (image != null && !image.isEmpty()) {
            try {
                r.setImage(image.getBytes());
                r.setImageContentType(image.getContentType());
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store image", e);
            }
        }
        return resourceRepository.save(r);
    }
    
    public Resource updateResourceMultipart(Long id, String name, String type, int capacity, String location, String status, String startTime, String endTime, org.springframework.web.multipart.MultipartFile image) {
        Resource existing = getResourceById(id);
        existing.setName(name);
        existing.setType(type);
        existing.setCapacity(capacity);
        existing.setLocation(location);
        existing.setStatus(status);
        existing.setStartTime(startTime);
        existing.setEndTime(endTime);
        existing.setAvailabilityWindows("Daily " + startTime + " to " + endTime);

        if (image != null && !image.isEmpty()) {
            try {
                existing.setImage(image.getBytes());
                existing.setImageContentType(image.getContentType());
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store image", e);
            }
        }
        return resourceRepository.save(existing);
    }
    
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String type, Integer minCapacity) {
        if (type != null && !type.isEmpty()) {
            return resourceRepository.findByTypeIgnoreCase(type);
        } else if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        return getAllResources();
    }
}
