package com.smartcampus.backend;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.service.BookingService;
import com.smartcampus.backend.service.NotificationService;
import com.smartcampus.backend.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingService — Module B
 * Member: Anne (IT2345599)
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceService resourceService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private Resource sampleResource;
    private User sampleUser;
    private Booking sampleBooking;
    private LocalDateTime start;
    private LocalDateTime end;

    @BeforeEach
    void setUp() {
        sampleResource = new Resource();
        sampleResource.setId(10L);
        sampleResource.setName("Conference Room B");
        sampleResource.setType("MEETING_ROOM");
        sampleResource.setStatus("ACTIVE");

        sampleUser = new User();
        sampleUser.setId(5L);
        sampleUser.setEmail("anne@university.lk");
        sampleUser.setName("Anne");
        sampleUser.setRole(Role.ROLE_USER);

        start = LocalDateTime.now().plusDays(1).withHour(9).withMinute(0);
        end = LocalDateTime.now().plusDays(1).withHour(11).withMinute(0);

        sampleBooking = new Booking();
        sampleBooking.setId(1L);
        sampleBooking.setResource(sampleResource);
        sampleBooking.setUser(sampleUser);
        sampleBooking.setStartTime(start);
        sampleBooking.setEndTime(end);
        sampleBooking.setPurpose("Team meeting");
        sampleBooking.setStatus(BookingStatus.PENDING);
    }

    @Test
    void createBookingRequest_noConflict_shouldCreatePendingBooking() {
        when(bookingRepository.findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, BookingStatus.APPROVED, end, start)).thenReturn(Collections.emptyList());
        when(resourceService.getResourceById(10L)).thenReturn(sampleResource);
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);

        Booking result = bookingService.createBookingRequest(5L, 10L, start, end, "Team meeting");

        assertThat(result.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(result.getPurpose()).isEqualTo("Team meeting");
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void createBookingRequest_withConflict_shouldThrowException() {
        Booking conflicting = new Booking();
        conflicting.setId(99L);
        conflicting.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, BookingStatus.APPROVED, end, start)).thenReturn(List.of(conflicting));

        assertThatThrownBy(() -> bookingService.createBookingRequest(5L, 10L, start, end, "Team meeting"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already successfully booked");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void updateBookingStatus_toApproved_shouldUpdateAndNotify() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.findByResourceIdAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                10L, BookingStatus.APPROVED, end, start)).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);

        Booking result = bookingService.updateBookingStatus(1L, BookingStatus.APPROVED, null);

        assertThat(result.getStatus()).isEqualTo(BookingStatus.APPROVED);
        verify(notificationService, times(1)).createNotification(eq(5L), anyString(), eq("SUCCESS"));
    }

    @Test
    void updateBookingStatus_toRejected_shouldStoreReason() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.updateBookingStatus(1L, BookingStatus.REJECTED, "No capacity");

        assertThat(result.getStatus()).isEqualTo(BookingStatus.REJECTED);
        assertThat(result.getRejectionReason()).isEqualTo("No capacity");
        verify(notificationService, times(1)).createNotification(eq(5L), anyString(), eq("WARNING"));
    }

    @Test
    void cancelBooking_byOwner_shouldSetCancelledStatus() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(sampleBooking);

        bookingService.cancelBooking(1L, 5L);

        verify(bookingRepository, times(1)).save(argThat(b -> b.getStatus() == BookingStatus.CANCELLED));
        verify(notificationService, times(1)).createNotification(eq(5L), anyString(), eq("WARNING"));
    }

    @Test
    void cancelBooking_byNonOwner_shouldThrowException() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unauthorized");

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void getUserBookings_shouldReturnOnlyUserBookings() {
        when(bookingRepository.findByUserId(5L)).thenReturn(List.of(sampleBooking));

        List<Booking> result = bookingService.getUserBookings(5L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUser().getId()).isEqualTo(5L);
    }
}
