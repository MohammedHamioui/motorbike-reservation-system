package fact.it.reservationservice.dto;

import lombok.Data;

@Data
public class ReservationDTO {
    private String id;
    private String clientId;
    private String motorbikeId;
    private String reservationDate;
    private String startDate;
    private String endDate;
}
