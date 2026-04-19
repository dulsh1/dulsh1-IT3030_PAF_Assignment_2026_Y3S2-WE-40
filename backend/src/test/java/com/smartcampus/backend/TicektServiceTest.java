package com.smartcampus.backend;

import com.smartcampus.backend.model.*;
import com.smartcampus.backend.repository.TicketAttachmentRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.service.NotificationService;
import com.smartcampus.backend.service.ResourceService;
import com.smartcampus.backend.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TicketService — Module C
 * Member: Samantha (IT234576869)
 */
@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository commentRepository;

    @Mock
    private TicketAttachmentRepository attachmentRepository;

    @Mock
    private ResourceService resourceService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TicketService ticketService;

    private Ticket sampleTicket;
    private Resource sampleResource;
    private User creator;
    private User technician;

    @BeforeEach
    void setUp() {
        sampleResource = new Resource();
        sampleResource.setId(1L);
        sampleResource.setName("Lab A101");

        creator = new User();
        creator.setId(1L);
        creator.setEmail("creator@university.lk");
        creator.setRole(Role.ROLE_USER);

        technician = new User();
        technician.setId(2L);
        technician.setEmail("tech@university.lk");
        technician.setRole(Role.ROLE_TECHNICIAN);

        sampleTicket = new Ticket();
        sampleTicket.setId(100L);
        sampleTicket.setResource(sampleResource);
        sampleTicket.setCreator(creator);
        sampleTicket.setCategory("IT_EQUIPMENT");
        sampleTicket.setDescription("Projector is broken");
        sampleTicket.setPriority("HIGH");
        sampleTicket.setContactDetails("ext-1234");
        sampleTicket.setStatus(TicketStatus.OPEN);
    }

    @Test
    void createTicket_shouldSaveWithOpenStatus() {
        when(resourceService.getResourceById(1L)).thenReturn(sampleResource);
        when(ticketRepository.save(any(Ticket.class))).thenReturn(sampleTicket);

        Ticket result = ticketService.createTicket(1L, 1L, "IT_EQUIPMENT", "Projector is broken", "HIGH", "ext-1234");

        assertThat(result.getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(result.getCategory()).isEqualTo("IT_EQUIPMENT");
        verify(ticketRepository, times(1)).save(any(Ticket.class));
        // Admins and Technicians should be notified on new ticket
        verify(notificationService, atLeastOnce()).notifyUsersByRole(any(Role.class), anyString(), anyString());
    }

    @Test
    void getTicketById_whenExists_shouldReturnTicket() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(sampleTicket));

        Ticket result = ticketService.getTicketById(100L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getDescription()).isEqualTo("Projector is broken");
    }

    @Test
    void getTicketById_whenNotFound_shouldThrowException() {
        when(ticketRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicketById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Ticket not found");
    }

    @Test
    void assignTechnician_shouldSetInProgress() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));

        Ticket result = ticketService.assignTechnician(100L, 2L);

        assertThat(result.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
        assertThat(result.getTechnician().getId()).isEqualTo(2L);
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), eq("INFO"));
    }

    @Test
    void updateTicketStatus_toResolved_shouldSetNotesAndNotifyCreator() {
        sampleTicket.setStatus(TicketStatus.IN_PROGRESS);
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));

        Ticket result = ticketService.updateTicketStatus(100L, TicketStatus.RESOLVED, "Replaced the projector lamp.");

        assertThat(result.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(result.getResolutionNotes()).isEqualTo("Replaced the projector lamp.");
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), eq("SUCCESS"));
    }

    @Test
    void addComment_shouldSaveCommentAndNotifyCreator() {
        TicketComment comment = new TicketComment();
        comment.setId(10L);
        comment.setTicket(sampleTicket);
        comment.setContent("We are looking into this.");

        User commenter = new User();
        commenter.setId(2L); // technician commenting

        comment.setUser(commenter);

        when(ticketRepository.findById(100L)).thenReturn(Optional.of(sampleTicket));
        when(commentRepository.save(any(TicketComment.class))).thenReturn(comment);

        TicketComment result = ticketService.addComment(100L, 2L, "We are looking into this.");

        assertThat(result.getContent()).isEqualTo("We are looking into this.");
        // Creator (id=1) should be notified since commenter is different (id=2)
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), eq("INFO"));
    }

    @Test
    void deleteComment_byOwner_shouldDelete() {
        TicketComment comment = new TicketComment();
        comment.setId(10L);
        comment.setUser(creator); // owned by creator (id=1)
        comment.setContent("test comment");

        when(commentRepository.findById(10L)).thenReturn(Optional.of(comment));
        doNothing().when(commentRepository).delete(comment);

        ticketService.deleteComment(10L, 1L);

        verify(commentRepository, times(1)).delete(comment);
    }

    @Test
    void deleteComment_byNonOwner_shouldThrowException() {
        TicketComment comment = new TicketComment();
        comment.setId(10L);
        comment.setUser(creator); // owned by creator (id=1)

        when(commentRepository.findById(10L)).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> ticketService.deleteComment(10L, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Unauthorized");

        verify(commentRepository, never()).delete(any());
    }

    @Test
    void getTicketsByCreator_shouldReturnOnlyOwnTickets() {
        when(ticketRepository.findByCreatorId(1L)).thenReturn(List.of(sampleTicket));

        List<Ticket> result = ticketService.getTicketsByCreator(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCreator().getId()).isEqualTo(1L);
    }
}
