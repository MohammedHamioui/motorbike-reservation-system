package fact.it.reservationservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@Document(collection = "reservations")
public class Reservation {
    private String id;
    private String clientId;
    private Long motorbikeId;
    private String reservationDate;
    private String startDate;
    private String endDate;
}