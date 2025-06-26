package fact.it.paymentservice.service;

import fact.it.paymentservice.model.Payment;
import fact.it.paymentservice.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final String RESERVATION_SERVICE_URL = "http://reservation-service:8083/reservations/";

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(String id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public void deletePayment(String id) {
        paymentRepository.deleteById(id);
    }

    public boolean reservationExists(String reservationId) {
        try {
            restTemplate.getForObject(RESERVATION_SERVICE_URL + reservationId, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }

    public Object getReservationDetails(String reservationId) {
        try {
            return restTemplate.getForObject(RESERVATION_SERVICE_URL + reservationId + "/details", Object.class);
        } catch (Exception e) {
            return null;
        }
    }

}