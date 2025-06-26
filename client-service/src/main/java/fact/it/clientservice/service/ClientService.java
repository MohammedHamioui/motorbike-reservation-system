package fact.it.clientservice.service;

import fact.it.clientservice.model.Client;
import fact.it.clientservice.repository.ClientRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client getClientById(String id) {
        return clientRepository.findById(id).orElse(null);
    }

    public Client saveClient(Client client) {
        Client savedClient = clientRepository.save(client);
        System.out.println("Saved client: " + savedClient);  // Log saved client
        return savedClient;
    }

    public void deleteClient(String id) {
        clientRepository.deleteById(id);
    }

    public Client updateClient(String id, Client updatedClient) {
        Client existingClient = clientRepository.findById(id).orElse(null);
        if (existingClient != null) {
            existingClient.setName(updatedClient.getName());
            existingClient.setEmail(updatedClient.getEmail());
            existingClient.setPhone(updatedClient.getPhone());
            existingClient.setAddress(updatedClient.getAddress());
            return clientRepository.save(existingClient);
        }
        return null;
    }

    public List<Client> getClientsByEmail(String email) {
        return clientRepository.findByEmail(email);
    }
}
