package fact.it.paymentservice.controller;

import fact.it.paymentservice.model.Payment;
import fact.it.paymentservice.service.PaymentService;
import fact.it.paymentservice.dto.PaymentDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}") public Payment getPaymentById(@PathVariable String id) { return paymentService.getPaymentById(id); }

    @PostMapping
    public ResponseEntity<?> savePayment(@RequestBody Payment payment) {
        if (!paymentService.reservationExists(payment.getReservationId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reservation does not exist");
        }
        Payment saved = paymentService.savePayment(payment);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable String id) {
        paymentService.deletePayment(id);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getPaymentDetails(@PathVariable String id) {
        Payment payment = paymentService.getPaymentById(id);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        Object reservationDetails = paymentService.getReservationDetails(payment.getReservationId());
        PaymentDetailsDTO dto = new PaymentDetailsDTO();
        dto.setId(payment.getId());
        dto.setReservationId(payment.getReservationId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setStatus(payment.getStatus());
        dto.setReservationDetails(reservationDetails);
        return ResponseEntity.ok(dto);
    }
}
