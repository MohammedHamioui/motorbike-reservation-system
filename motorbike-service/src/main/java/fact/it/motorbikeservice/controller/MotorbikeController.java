package fact.it.motorbikeservice.controller;

import fact.it.motorbikeservice.dto.MotorbikeDTO;
import fact.it.motorbikeservice.model.Motorbike;
import fact.it.motorbikeservice.service.MotorbikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/motorbikes")
@RequiredArgsConstructor
public class MotorbikeController {

    private final MotorbikeService motorbikeService;  // assuming you have a service for handling logic

    @GetMapping
    public List<Motorbike> getAllMotorbikes() {
        return motorbikeService.getAllMotorbikes();
    }

    @GetMapping("/{id}")
    public Motorbike getMotorbikeById(@PathVariable Long id) {
        return motorbikeService.getMotorbikeById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteMotorbikeById(@PathVariable Long id) {
        motorbikeService.deleteMotorbikeById(id);
    }

    @PostMapping
    public Motorbike createMotorbike(@RequestBody MotorbikeDTO motorbikeDTO) {
        return motorbikeService.createMotorbike(motorbikeDTO);
    }
}
