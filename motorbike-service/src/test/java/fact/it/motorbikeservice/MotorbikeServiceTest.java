package fact.it.motorbikeservice;

import fact.it.motorbikeservice.dto.MotorbikeDTO;
import fact.it.motorbikeservice.model.Motorbike;
import fact.it.motorbikeservice.repository.MotorbikeRepository;
import fact.it.motorbikeservice.service.MotorbikeService;
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

class MotorbikeServiceTest {
    @Mock
    private MotorbikeRepository motorbikeRepository;

    @InjectMocks
    private MotorbikeService motorbikeService;

    private Motorbike motorbike;
    private MotorbikeDTO motorbikeDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        motorbike = new Motorbike(1L, "Yamaha", "MT-07", "2022", 7000.0);
        motorbikeDTO = new MotorbikeDTO("Yamaha", "MT-07", "2022", 7000.0);
    }

    @Test
    void testGetAllMotorbikes() {
        when(motorbikeRepository.findAll()).thenReturn(Arrays.asList(motorbike));
        List<Motorbike> motorbikes = motorbikeService.getAllMotorbikes();
        assertEquals(1, motorbikes.size());
        assertEquals("Yamaha", motorbikes.get(0).getMake());
    }

    @Test
    void testGetMotorbikeById() {
        when(motorbikeRepository.findById(1L)).thenReturn(Optional.of(motorbike));
        Motorbike found = motorbikeService.getMotorbikeById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());
    }

    @Test
    void testCreateMotorbike() {
        when(motorbikeRepository.save(any(Motorbike.class))).thenReturn(motorbike);
        Motorbike created = motorbikeService.createMotorbike(motorbikeDTO);
        assertEquals("Yamaha", created.getMake());
    }

    @Test
    void testDeleteMotorbikeById() {
        doNothing().when(motorbikeRepository).deleteById(1L);
        assertDoesNotThrow(() -> motorbikeService.deleteMotorbikeById(1L));
        verify(motorbikeRepository, times(1)).deleteById(1L);
    }
} 