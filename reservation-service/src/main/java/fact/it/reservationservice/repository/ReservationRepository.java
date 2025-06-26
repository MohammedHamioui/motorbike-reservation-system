package fact.it.reservationservice.repository;

import fact.it.reservationservice.model.Reservation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    // You can add custom query methods if needed
}
