package fact.it.motorbikeservice.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Motorbike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // This auto-generates the ID
    private Long id;
    private String make;
    private String model;
    private String year;
    private double price;
}
