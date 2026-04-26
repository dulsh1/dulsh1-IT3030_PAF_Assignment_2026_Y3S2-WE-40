package com.smartcampus.backend;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ResourceService
 */
@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource sampleResource;

    @BeforeEach
    void setUp() {
        sampleResource = new Resource();
        sampleResource.setId(1L);
        sampleResource.setName("Lab A101");
        sampleResource.setType("LAB");
        sampleResource.setCapacity(30);
        sampleResource.setLocation("Block A, Floor 1");
        sampleResource.setStatus("ACTIVE");
    }

    @Test
    void getAllResources_shouldReturnAllResources() {
        Resource r2 = new Resource();
        r2.setId(2L);
        r2.setName("Meeting Room 201");
        r2.setType("MEETING_ROOM");
        r2.setCapacity(10);
        r2.setLocation("Block B");
        r2.setStatus("ACTIVE");

        when(resourceRepository.findAll()).thenReturn(Arrays.asList(sampleResource, r2));

        List<Resource> result = resourceService.getAllResources();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Lab A101");
        assertThat(result.get(1).getName()).isEqualTo("Meeting Room 201");
        verify(resourceRepository, times(1)).findAll();
    }

    @Test
    void getResourceById_whenExists_shouldReturnResource() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(sampleResource));

        Resource result = resourceService.getResourceById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Lab A101");
    }

    @Test
    void getResourceById_whenNotFound_shouldThrowException() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Resource not found");
    }

    @Test
    void createResource_shouldSaveAndReturnResource() {
        Resource toSave = new Resource();
        toSave.setName("Projector P01");
        toSave.setType("EQUIPMENT");
        toSave.setCapacity(0);
        toSave.setLocation("Store Room");
        toSave.setStatus("ACTIVE");
        toSave.setStartTime("08:00");
        toSave.setEndTime("18:00");

        when(resourceRepository.save(any(Resource.class))).thenReturn(toSave);

        Resource result = resourceService.createResource(
                "Projector P01", "EQUIPMENT", 0, "Store Room", "ACTIVE", "08:00", "18:00", null);

        assertThat(result.getName()).isEqualTo("Projector P01");
        assertThat(result.getType()).isEqualTo("EQUIPMENT");
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void deleteResource_shouldCallDeleteById() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository, times(1)).deleteById(1L);
    }

    @Test
    void searchResources_byType_shouldReturnFilteredResults() {
        when(resourceRepository.findByTypeIgnoreCase("LAB")).thenReturn(List.of(sampleResource));

        List<Resource> result = resourceService.searchResources("LAB", null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getType()).isEqualTo("LAB");
        verify(resourceRepository, times(1)).findByTypeIgnoreCase("LAB");
    }

    @Test
    void searchResources_byMinCapacity_shouldReturnFilteredResults() {
        when(resourceRepository.findByCapacityGreaterThanEqual(20)).thenReturn(List.of(sampleResource));

        List<Resource> result = resourceService.searchResources(null, 20);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCapacity()).isGreaterThanOrEqualTo(20);
        verify(resourceRepository, times(1)).findByCapacityGreaterThanEqual(20);
    }
}
