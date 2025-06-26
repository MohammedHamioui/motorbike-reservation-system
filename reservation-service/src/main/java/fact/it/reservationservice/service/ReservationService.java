package fact.it.reservationservice.service;

import fact.it.reservationservice.model.Reservation;
import fact.it.reservationservice.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RestTemplate restTemplate;

    private final String CLIENT_SERVICE_URL = "http://client-service:8082/clients/";
    private final String MOTORBIKE_SERVICE_URL = "http://motorbike-service:8081/motorbikes/";

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation getReservationById(String id) {
        return reservationRepository.findById(id).orElse(null);
    }

    public Reservation saveReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(String id) {
        reservationRepository.deleteById(id);
    }

    public boolean clientExists(String clientId) {
        try {
            restTemplate.getForObject(CLIENT_SERVICE_URL + clientId, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }

    public boolean motorbikeExists(Long motorbikeId) {
        try {
            restTemplate.getForObject(MOTORBIKE_SERVICE_URL + motorbikeId, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }

    public Object getClientDetails(String clientId) {
        try {
            return restTemplate.getForObject(CLIENT_SERVICE_URL + clientId, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Object getMotorbikeDetails(Long motorbikeId) {
        try {
            return restTemplate.getForObject(MOTORBIKE_SERVICE_URL + motorbikeId, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Reservation updateReservation(String id, Reservation updatedReservation) {
        Reservation existing = reservationRepository.findById(id).orElse(null);
        if (existing == null) {
            throw new RuntimeException("Reservation not found with id: " + id);
        }
        // Validate client and motorbike existence
        if (!clientExists(updatedReservation.getClientId())) {
            throw new RuntimeException("Client does not exist");
        }
        if (!motorbikeExists(updatedReservation.getMotorbikeId())) {
            throw new RuntimeException("Motorbike does not exist");
        }
        existing.setClientId(updatedReservation.getClientId());
        existing.setMotorbikeId(updatedReservation.getMotorbikeId());
        existing.setReservationDate(updatedReservation.getReservationDate());
        existing.setStartDate(updatedReservation.getStartDate());
        existing.setEndDate(updatedReservation.getEndDate());
        return reservationRepository.save(existing);
    }
}