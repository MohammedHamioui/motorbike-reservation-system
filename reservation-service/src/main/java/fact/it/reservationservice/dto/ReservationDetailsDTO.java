package fact.it.reservationservice.dto;

import lombok.Data;

@Data
public class ReservationDetailsDTO {
    private String id;
    private Object client;
    private Object motorbike;
    private String reservationDate;
    private String startDate;
    private String endDate;
} 