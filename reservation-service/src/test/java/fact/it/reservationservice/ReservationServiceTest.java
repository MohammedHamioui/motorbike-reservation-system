package fact.it.reservationservice;

import fact.it.reservationservice.model.Reservation;
import fact.it.reservationservice.repository.ReservationRepository;
import fact.it.reservationservice.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservationServiceTest {
    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reservation = new Reservation("1", "client1", 1L, "2024-06-01", "2024-06-10", "2024-06-15");
    }

    @Test
    void testGetAllReservations() {
        when(reservationRepository.findAll()).thenReturn(Arrays.asList(reservation));
        List<Reservation> reservations = reservationService.getAllReservations();
        assertEquals(1, reservations.size());
        assertEquals("client1", reservations.get(0).getClientId());
    }

    @Test
    void testGetReservationById() {
        when(reservationRepository.findById("1")).thenReturn(Optional.of(reservation));
        Reservation found = reservationService.getReservationById("1");
        assertNotNull(found);
        assertEquals("1", found.getId());
    }

    @Test
    void testSaveReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        Reservation saved = reservationService.saveReservation(reservation);
        assertEquals("client1", saved.getClientId());
    }

    @Test
    void testDeleteReservation() {
        doNothing().when(reservationRepository).deleteById("1");
        assertDoesNotThrow(() -> reservationService.deleteReservation("1"));
        verify(reservationRepository, times(1)).deleteById("1");
    }
} 