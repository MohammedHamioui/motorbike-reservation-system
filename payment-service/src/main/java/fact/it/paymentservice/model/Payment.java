package fact.it.paymentservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
    private String id;
    private String reservationId;
    private double amount;
    private String paymentDate;
    private String status;  // E.g., "Paid", "Pending"
}