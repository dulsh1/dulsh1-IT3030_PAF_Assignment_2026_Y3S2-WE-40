package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Core conflict resolution query logic
    List<Booking> findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Long resourceId, BookingStatus status, LocalDateTime endTime, LocalDateTime startTime);
            
    List<Booking> findByUserId(Long userId);
    List<Booking> findByStatus(BookingStatus status);
}
