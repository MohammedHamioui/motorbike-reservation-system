package fact.it.motorbikeservice.service;

import fact.it.motorbikeservice.dto.MotorbikeDTO;
import fact.it.motorbikeservice.model.Motorbike;
import fact.it.motorbikeservice.repository.MotorbikeRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MotorbikeService {

    private final MotorbikeRepository motorbikeRepository;

    // Get all motorbikes
    public List<Motorbike> getAllMotorbikes() {
        return motorbikeRepository.findAll();
    }

    // Get a motorbike by ID
    public Motorbike getMotorbikeById(Long id) {
        Optional<Motorbike> motorbike = motorbikeRepository.findById(id);
        if (motorbike.isPresent()) {
            return motorbike.get();
        } else {
            throw new RuntimeException("Motorbike not found with id: " + id);
        }
    }

    public void deleteMotorbikeById(Long id) {
        motorbikeRepository.deleteById(id);
    }

    // Create a new motorbike
    public Motorbike createMotorbike(MotorbikeDTO motorbikeDTO) {
        Motorbike motorbike = new Motorbike();
        motorbike.setMake(motorbikeDTO.getMake());
        motorbike.setModel(motorbikeDTO.getModel());
        motorbike.setYear(motorbikeDTO.getYear());
        motorbike.setPrice(motorbikeDTO.getPrice());
        return motorbikeRepository.save(motorbike);
    }
}
