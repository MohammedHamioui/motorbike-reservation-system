package fact.it.clientservice.repository;

import fact.it.clientservice.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClientRepository extends MongoRepository<Client, String> {
    // You can add custom query methods if needed
    List<Client> findByEmail(String email);
}
