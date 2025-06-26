package fact.it.paymentservice.dto;

import lombok.Data;

@Data
public class PaymentDTO {
    private String id;
    private String reservationId;
    private double amount;
    private String paymentDate;
    private String status;
}
