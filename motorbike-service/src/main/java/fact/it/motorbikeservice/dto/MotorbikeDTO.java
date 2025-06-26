package fact.it.motorbikeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MotorbikeDTO {
    private String make;
    private String model;
    private String year;
    private double price;
}
