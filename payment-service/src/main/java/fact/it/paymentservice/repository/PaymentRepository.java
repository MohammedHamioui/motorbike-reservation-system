package fact.it.paymentservice.repository;

import fact.it.paymentservice.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    // You can add custom query methods if needed
}
