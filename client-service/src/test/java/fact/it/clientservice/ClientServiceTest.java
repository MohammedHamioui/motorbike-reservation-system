package fact.it.clientservice;

import fact.it.clientservice.model.Client;
import fact.it.clientservice.repository.ClientRepository;
import fact.it.clientservice.service.ClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ClientServiceTest {
    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    private Client client;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        client = new Client();
        client.setId("1");
        client.setName("John Doe");
        client.setEmail("john@example.com");
        client.setPhone("1234567890");
        client.setAddress("123 Main St");
    }

    @Test
    void testGetAllClients() {
        when(clientRepository.findAll()).thenReturn(Arrays.asList(client));
        List<Client> clients = clientService.getAllClients();
        assertEquals(1, clients.size());
        assertEquals("John Doe", clients.get(0).getName());
    }

    @Test
    void testGetClientById() {
        when(clientRepository.findById("1")).thenReturn(Optional.of(client));
        Client found = clientService.getClientById("1");
        assertNotNull(found);
        assertEquals("1", found.getId());
    }

    @Test
    void testSaveClient() {
        when(clientRepository.save(client)).thenReturn(client);
        Client saved = clientService.saveClient(client);
        assertEquals("John Doe", saved.getName());
    }

    @Test
    void testUpdateClient() {
        Client updated = new Client("1", "Jane Doe", "jane@example.com", "0987654321", "456 Main St");
        when(clientRepository.findById("1")).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(updated);
        Client result = clientService.updateClient("1", updated);
        assertNotNull(result);
        assertEquals("Jane Doe", result.getName());
        assertEquals("jane@example.com", result.getEmail());
    }

    @Test
    void testDeleteClient() {
        doNothing().when(clientRepository).deleteById("1");
        assertDoesNotThrow(() -> clientService.deleteClient("1"));
        verify(clientRepository, times(1)).deleteById("1");
    }

    @Test
    void testGetClientsByEmail() {
        when(clientRepository.findByEmail("john@example.com")).thenReturn(Arrays.asList(client));
        List<Client> clients = clientService.getClientsByEmail("john@example.com");
        assertEquals(1, clients.size());
        assertEquals("john@example.com", clients.get(0).getEmail());
    }
} 