package fact.it.motorbikeservice.repository;

import fact.it.motorbikeservice.model.Motorbike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MotorbikeRepository extends JpaRepository<Motorbike, Long> {
    // Custom query methods can go here if needed
}
