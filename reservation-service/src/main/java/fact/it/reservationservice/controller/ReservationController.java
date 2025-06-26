package fact.it.reservationservice.controller;

import fact.it.reservationservice.model.Reservation;
import fact.it.reservationservice.service.ReservationService;
import fact.it.reservationservice.dto.ReservationDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/{id}")
    public Reservation getReservationById(@PathVariable String id) {
        return reservationService.getReservationById(id);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getReservationDetails(@PathVariable String id) {
        Reservation reservation = reservationService.getReservationById(id);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        Object client = reservationService.getClientDetails(reservation.getClientId());
        Object motorbike = reservationService.getMotorbikeDetails(reservation.getMotorbikeId());
        ReservationDetailsDTO dto = new ReservationDetailsDTO();
        dto.setId(reservation.getId());
        dto.setClient(client);
        dto.setMotorbike(motorbike);
        dto.setReservationDate(reservation.getReservationDate());
        dto.setStartDate(reservation.getStartDate());
        dto.setEndDate(reservation.getEndDate());
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> saveReservation(@RequestBody Reservation reservation) {
        if (!reservationService.clientExists(reservation.getClientId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client does not exist");
        }
        if (!reservationService.motorbikeExists(reservation.getMotorbikeId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Motorbike does not exist");
        }
        Reservation saved = reservationService.saveReservation(reservation);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable String id) {
        reservationService.deleteReservation(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(@PathVariable String id, @RequestBody Reservation reservation) {
        try {
            Reservation updated = reservationService.updateReservation(id, reservation);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
