package fact.it.paymentservice;

import fact.it.paymentservice.model.Payment;
import fact.it.paymentservice.repository.PaymentRepository;
import fact.it.paymentservice.service.PaymentService;
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

class PaymentServiceTest {
    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        payment = new Payment("1", "res1", 100.0, "2024-06-01", "Paid");
    }

    @Test
    void testGetAllPayments() {
        when(paymentRepository.findAll()).thenReturn(Arrays.asList(payment));
        List<Payment> payments = paymentService.getAllPayments();
        assertEquals(1, payments.size());
        assertEquals("res1", payments.get(0).getReservationId());
    }

    @Test
    void testGetPaymentById() {
        when(paymentRepository.findById("1")).thenReturn(Optional.of(payment));
        Payment found = paymentService.getPaymentById("1");
        assertNotNull(found);
        assertEquals("1", found.getId());
    }

    @Test
    void testSavePayment() {
        when(paymentRepository.save(payment)).thenReturn(payment);
        Payment saved = paymentService.savePayment(payment);
        assertEquals("res1", saved.getReservationId());
    }

    @Test
    void testDeletePayment() {
        doNothing().when(paymentRepository).deleteById("1");
        assertDoesNotThrow(() -> paymentService.deletePayment("1"));
        verify(paymentRepository, times(1)).deleteById("1");
    }
} 