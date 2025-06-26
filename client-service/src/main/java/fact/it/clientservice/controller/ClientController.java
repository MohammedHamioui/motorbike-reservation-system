package fact.it.clientservice.controller;

import fact.it.clientservice.model.Client;
import fact.it.clientservice.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping
    public List<Client> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{id}")
    public Client getClientById(@PathVariable String id) {
        return clientService.getClientById(id);
    }

    @PostMapping
    public Client saveClient(@RequestBody Client client) {
        return clientService.saveClient(client);
    }

    @PostMapping("/test")
    public String testEndpoint(@RequestBody Map<String, Object> requestBody) {
        System.out.println("Received request body: " + requestBody);
        return "Request received";
    }

    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable String id) {
        clientService.deleteClient(id);
    }

    @PutMapping("/{id}")
    public Client updateClient(@PathVariable String id, @RequestBody Client client) {
        return clientService.updateClient(id, client);
    }

    @GetMapping(params = "email")
    public List<Client> getClientsByEmail(@RequestParam String email) {
        return clientService.getClientsByEmail(email);
    }
}
