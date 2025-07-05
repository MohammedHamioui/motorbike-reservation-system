# Advanced Programming Topics Project

## Motorbike Reservation System

A microservices-based application for managing motorbike reservations.

### Developer
- Mohammed Hamioui

### Technologies Used
- **Java** (Spring Boot)
- **React** (Front-end)
- **Docker** (Containerization)

### Contents
- [Introduction](#introduction)
- [Architecture](#architecture)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker Compose](#docker-compose)
- [OAuth2 Security](#oauth2-security)
- [Postman](#postman)
- [Unit Tests](#unit-tests)
- [Front-end](#front-end)


## Introduction

The system consists of four independent microservices, each built with **Java Spring Boot** and connected to its own dedicated database:

- **Client Service** (MongoDB)
- **Motorbike Service** (MySQL)
- **Reservation Service** (MongoDB)
- **Payment Service** (MongoDB)

All services are containerized and managed using **Docker Compose**, enabling easy setup and scalability. A centralized **API Gateway** secures all incoming requests with **OAuth2 authentication**, ensuring robust access control across microservices. A fully automated **CI/CD pipeline** handles building, testing, and deploying services, supporting a seamless development workflow.

## Architecture
Details about your system architecture.

## CI/CD Pipeline
This project uses a CI/CD pipeline to automate building, testing, and deploying the microservices. All code and version control is handled by GitHub actions.
```yaml
name: CI/CD Build, Test, and Dockerize Microservices

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    name: Build & Test Microservices
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - client-service
          - motorbike-service
          - reservation-service
          - payment-service
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          cache: 'maven'
          distribution: 'temurin'

      - name: Build and test ${{ matrix.service }}
        run: mvn package -B
        working-directory: ./${{ matrix.service }}

  # Build Docker images for all services after successful build & test
  docker-build:
    name: Build Docker Images
    runs-on: ubuntu-latest
    needs: build-and-test
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-buildx-

      - name: Build api-gateway image
        run: docker build -t api-gateway ./api-gateway

      - name: Build client-service image
        run: docker build -t client-service ./client-service

      - name: Build motorbike-service image
        run: docker build -t motorbike-service ./motorbike-service

      - name: Build reservation-service image
        run: docker build -t reservation-service ./reservation-service

      - name: Build payment-service image
        run: docker build -t payment-service ./payment-service

      - name: Build all images with docker-compose
        run: docker compose build
        continue-on-error: true
```

## Docker Compose
This Docker Compose setup orchestrates a collection of interdependent services within isolated containers, each responsible for a distinct function of the **Motorbike Reservation System**. It includes database containers running MongoDB and MySQL, alongside specialized microservices that manage client information, motorbike inventory, reservation processing, and payment handling. By leveraging container orchestration, the system achieves streamlined communication between components, enhanced scalability, and simplified deployment workflows.

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6.0
    container_name: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: motorbikedb
    ports:
      - "33306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - client-service
      - motorbike-service
      - reservation-service
      - payment-service
    environment:
      - SPRING_PROFILES_ACTIVE=default
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

  client-service:
    build: ./client-service
    ports:
      - "8082:8082"
    depends_on:
      - mongo
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/clientdb

  motorbike-service:
    build: ./motorbike-service
    ports:
      - "8081:8081"
    depends_on:
      - mysql
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/motorbikedb?createDatabaseIfNotExist=true
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=1234

  reservation-service:
    build: ./reservation-service
    ports:
      - "8083:8083"
    depends_on:
      - mysql
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/reservationdb?createDatabaseIfNotExist=true
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=1234

  payment-service:
    build: ./payment-service
    ports:
      - "8084:8084"
    depends_on:
      - mongo
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/paymentdb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api-gateway

volumes:
  mongo_data:
  mysql_data: 
```

![image](https://github.com/user-attachments/assets/7e6ea4bb-85d8-450b-a73f-6f227a8c9bf2)


## OAuth2 Security
OAuth2 authentication is enforced at the **API Gateway**, securing sensitive endpoints and actions such as reading, creating, updating, or deleting reservations, motorbikes, payments, and client information. Unauthenticated users have limited access and can only view available motorbikes.

```java
package fact.it.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity serverHttpSecurity) {
        serverHttpSecurity
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange ->
                        exchange.pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .pathMatchers(HttpMethod.GET, "/motorbikes/**")
                                .permitAll()
                                .pathMatchers("/login**", "/oauth2/**", "/")
                                .permitAll()
                                .anyExchange()
                                .authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(withDefaults())
                )
                .oauth2Login(oauth2 -> oauth2
                        .authenticationSuccessHandler(
                                new RedirectServerAuthenticationSuccessHandler("http://localhost:3000/")
                        )
                );
        return serverHttpSecurity.build();
    }
}
````

You must provide a valid access token to access the **API Gateway** protected by OAuth2 authentication. Attempting to call a secured endpoint without proper authentication will result in a 401 Unauthorized error.

![image](https://github.com/user-attachments/assets/54f20608-ebe7-4726-8e52-a5a5a9323dce)

With a valid access token, you can access secured endpoints to retrieve, update, add, or delete resources.

![image](https://github.com/user-attachments/assets/81b91543-e4c7-488b-9147-2fabfe5cc3b0)


## Postman
Below are all the endpoints available for each service, accompanied by example requests.

### Client Service

| Method | Endpoint             | Description                |
|--------|----------------------|----------------------------|
| GET    | /clients             | Get all clients            |
| GET    | /clients/{id}        | Get client by ID           |
| POST   | /clients             | Create a new client        |
| PUT    | /clients/{id}        | Update client by ID        |
| DELETE | /clients/{id}        | Delete client by ID        |

#### GET /clients
![image](https://github.com/user-attachments/assets/da75eef2-9956-46dc-825d-27a87741fdc5)

#### GET /clients/{id}
![image](https://github.com/user-attachments/assets/d079d910-7096-4c00-a0d5-63207de88680)

#### POST /clients
![image](https://github.com/user-attachments/assets/8de7135e-8b8c-4e7f-97fb-6fa34a7d9967)

#### PUT /clients/{id}
![image](https://github.com/user-attachments/assets/9ddd416e-bb90-4ec2-8355-a8faeff8c362)

#### Delete /clients/{id}
![image](https://github.com/user-attachments/assets/f991124b-2736-427a-a485-27ecb6e164fa)

### Motorbike Service

| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | /motorbikes           | Get all motorbikes        |
| GET    | /motorbikes/{id}      | Get motorbike by ID       |
| POST   | /motorbikes           | Create a new motorbike    |
| PUT    | /motorbikes/{id}      | Update motorbike by ID    |
| DELETE | /motorbikes/{id}      | Delete motorbike by ID    |

#### GET /motorbikes
![image](https://github.com/user-attachments/assets/13639a6b-6c9f-4d85-89c1-93e027263a9f)

#### GET /motorbikes/{id}
![image](https://github.com/user-attachments/assets/6c4a7e0e-46fa-457e-ae3f-41f240eb689a)

#### POST /motorbikes
![image](https://github.com/user-attachments/assets/d3366d8d-f3c6-4ceb-9fcb-dd1592ce9cfc)

#### PUT /motorbikes/{id}
![image](https://github.com/user-attachments/assets/a6fd9dd6-c193-4faa-92f8-5b73005782fb)

#### DELETE /motorbikes/{id}
![image](https://github.com/user-attachments/assets/0da700fc-93f1-4aac-affb-182475cf14c9)

### Reservation Service

| Method | Endpoint                       | Description                                      |
|--------|--------------------------------|--------------------------------------------------|
| GET    | /reservations                  | Get all reservations                             |
| GET    | /reservations/{id}             | Get reservation by ID                            |
| GET    | /reservations/{id}/details     | Get reservation details with client and motorbike info |
| POST   | /reservations                  | Create a new reservation                         |
| PUT    | /reservations/{id}             | Update reservation by ID                         |
| DELETE | /reservations/{id}             | Delete reservation by ID                         |

#### GET /reservations
![image](https://github.com/user-attachments/assets/11409c92-7a7b-41ee-b8e3-66b7613cea7f)

#### GET /reservations/{id}
![image](https://github.com/user-attachments/assets/2ac4bb01-bff6-4d03-a030-a65d55ca2b18)

#### GET /reservations/{id}/details
![image](https://github.com/user-attachments/assets/2ec58c0c-9b8b-4167-8a2a-2ac41ee32e17)

#### POST /reservations
![image](https://github.com/user-attachments/assets/108cac3e-213d-4465-8e6f-2f875ed8441d)

#### PUT /reservations/{id}
![image](https://github.com/user-attachments/assets/64004a9a-7f42-4643-92a5-a4f7b48b6206)

#### DELETE /reservations/{id}
![image](https://github.com/user-attachments/assets/c9bc37a5-4194-4f9c-9ddb-cf072eeea8bc)


### Payment Service

| Method | Endpoint                   | Description                              |
|--------|----------------------------|------------------------------------------|
| GET    | /payments                  | Get all payments                         |
| GET    | /payments/{id}             | Get payment by ID                        |
| GET    | /payments/{id}/details     | Get payment details with reservation info|
| POST   | /payments                  | Create a new payment                     |
| PUT    | /payments/{id}             | Update payment by ID                     |
| DELETE | /payments/{id}             | Delete payment by ID                     |

#### GET /payments
![image](https://github.com/user-attachments/assets/ad96ea36-b56c-4f68-a834-ea8321a154cb)

#### GET /payments/{id}
![image](https://github.com/user-attachments/assets/5619d8f2-54c5-48e2-8bec-ba031c6649f1)

#### GET /payments/{id}/details
![image](https://github.com/user-attachments/assets/45bdd4da-8153-4171-a5a0-e9e54f7089e1)

#### POST /payments
![image](https://github.com/user-attachments/assets/5caf5ef1-cfc9-40f3-871f-7bfe9b1804d8)

#### PUT /payments/{id}
![image](https://github.com/user-attachments/assets/49c29cc7-0b71-4ad7-92f4-36f6b6dce7a1)

#### DELETE /payments/{id}
![image](https://github.com/user-attachments/assets/2285ee1a-a591-4978-ab90-3f421e5f46ec)

## Unit Tests
Each microservice includes its own dedicated unit tests to ensure that core functionalities work as expected. These tests use **JUnit** and **Mockito** to create mock data, simulate real-world scenarios, and isolate service logic. This approach helps maintain high code quality, catch bugs early, and make future changes safer and more reliable.

### Client service
```java
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
```
![image](https://github.com/user-attachments/assets/d73ba0f8-c83d-42cf-9a3d-e83fcd991f9e)

### Motorbike service
```java
package fact.it.motorbikeservice;

import fact.it.motorbikeservice.dto.MotorbikeDTO;
import fact.it.motorbikeservice.model.Motorbike;
import fact.it.motorbikeservice.repository.MotorbikeRepository;
import fact.it.motorbikeservice.service.MotorbikeService;
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

class MotorbikeServiceTest {
    @Mock
    private MotorbikeRepository motorbikeRepository;

    @InjectMocks
    private MotorbikeService motorbikeService;

    private Motorbike motorbike;
    private MotorbikeDTO motorbikeDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        motorbike = new Motorbike(1L, "Yamaha", "MT-07", "2022", 7000.0);
        motorbikeDTO = new MotorbikeDTO("Yamaha", "MT-07", "2022", 7000.0);
    }

    @Test
    void testGetAllMotorbikes() {
        when(motorbikeRepository.findAll()).thenReturn(Arrays.asList(motorbike));
        List<Motorbike> motorbikes = motorbikeService.getAllMotorbikes();
        assertEquals(1, motorbikes.size());
        assertEquals("Yamaha", motorbikes.get(0).getMake());
    }

    @Test
    void testGetMotorbikeById() {
        when(motorbikeRepository.findById(1L)).thenReturn(Optional.of(motorbike));
        Motorbike found = motorbikeService.getMotorbikeById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());
    }

    @Test
    void testCreateMotorbike() {
        when(motorbikeRepository.save(any(Motorbike.class))).thenReturn(motorbike);
        Motorbike created = motorbikeService.createMotorbike(motorbikeDTO);
        assertEquals("Yamaha", created.getMake());
    }

    @Test
    void testDeleteMotorbikeById() {
        doNothing().when(motorbikeRepository).deleteById(1L);
        assertDoesNotThrow(() -> motorbikeService.deleteMotorbikeById(1L));
        verify(motorbikeRepository, times(1)).deleteById(1L);
    }
} 
```
![image](https://github.com/user-attachments/assets/c0608ec5-a140-4ed7-87de-893c02a53297)

### Payment service
```java
package fact.it.paymentservice;

import fact.it.paymentservice.model.Payment;
import fact.it.paymentservice.repository.PaymentRepository;
import fact.it.paymentservice.service.PaymentService;
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

class PaymentServiceTest {
    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        payment = new Payment("1", "res1", 100.0, "2024-06-01", "Paid");
    }

    @Test
    void testGetAllPayments() {
        when(paymentRepository.findAll()).thenReturn(Arrays.asList(payment));
        List<Payment> payments = paymentService.getAllPayments();
        assertEquals(1, payments.size());
        assertEquals("res1", payments.get(0).getReservationId());
    }

    @Test
    void testGetPaymentById() {
        when(paymentRepository.findById("1")).thenReturn(Optional.of(payment));
        Payment found = paymentService.getPaymentById("1");
        assertNotNull(found);
        assertEquals("1", found.getId());
    }

    @Test
    void testSavePayment() {
        when(paymentRepository.save(payment)).thenReturn(payment);
        Payment saved = paymentService.savePayment(payment);
        assertEquals("res1", saved.getReservationId());
    }

    @Test
    void testDeletePayment() {
        doNothing().when(paymentRepository).deleteById("1");
        assertDoesNotThrow(() -> paymentService.deletePayment("1"));
        verify(paymentRepository, times(1)).deleteById("1");
    }
} 
```
![image](https://github.com/user-attachments/assets/167d0c7b-1b6b-4704-a1da-8b68a708fb97)

### Reservation service
```java
package fact.it.reservationservice;

import fact.it.reservationservice.model.Reservation;
import fact.it.reservationservice.repository.ReservationRepository;
import fact.it.reservationservice.service.ReservationService;
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

class ReservationServiceTest {
    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reservation = new Reservation("1", "client1", 1L, "2024-06-01", "2024-06-10", "2024-06-15");
    }

    @Test
    void testGetAllReservations() {
        when(reservationRepository.findAll()).thenReturn(Arrays.asList(reservation));
        List<Reservation> reservations = reservationService.getAllReservations();
        assertEquals(1, reservations.size());
        assertEquals("client1", reservations.get(0).getClientId());
    }

    @Test
    void testGetReservationById() {
        when(reservationRepository.findById("1")).thenReturn(Optional.of(reservation));
        Reservation found = reservationService.getReservationById("1");
        assertNotNull(found);
        assertEquals("1", found.getId());
    }

    @Test
    void testSaveReservation() {
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        Reservation saved = reservationService.saveReservation(reservation);
        assertEquals("client1", saved.getClientId());
    }

    @Test
    void testDeleteReservation() {
        doNothing().when(reservationRepository).deleteById("1");
        assertDoesNotThrow(() -> reservationService.deleteReservation("1"));
        verify(reservationRepository, times(1)).deleteById("1");
    }
} 
```
![image](https://github.com/user-attachments/assets/bba8b7c3-998c-4fcf-b5c1-b9d6b3510bca)

## Front-end

The front-end of the **Motorbike Reservation System** is built with **React**, providing users with an intuitive and responsive interface to interact with the system. It communicates with the microservices through the API Gateway, handling tasks like viewing available motorbikes, making reservations, and managing client information. The UI is designed to be user-friendly and efficient, ensuring a smooth user experience across different devices.

The Homepage welcomes you to the application.

![image](https://github.com/user-attachments/assets/0553276f-637d-446f-8550-8b0aee0a9fdb)

As you can see on the side navigation menu on the right you have access to 4 pages
- Motorbikes
- Clients
- Reservations
- Payments

![image](https://github.com/user-attachments/assets/3185db19-2c83-44d5-a866-fbdc1f4e8fc0)

At the top right of the application, users will find a button that allows them to log in with their Google account. Once authenticated, they gain access to secured features and actions within the system.

![image](https://github.com/user-attachments/assets/2907a332-80e6-4936-897e-6a3d8350fb83)

After successfully logging in with your Google account, the application will welcome you and grant you access to additional features such as creating, updating, or deleting reservations and managing your client information.

![image](https://github.com/user-attachments/assets/49f9f323-f5f9-42f8-ae24-b2a545346d58)

The UserController in the API Gateway is responsible for retrieving the user’s name and email address.

```java
package fact.it.apigateway.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {
    @GetMapping("/user")
    public Map<String, Object> user(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return Map.of();
        }
        return Map.of(
            "name", principal.getFullName(),
            "email", principal.getEmail()
        );
    }
}

```

The function **AuthStatus()** in App.jsx retrieves the authenticated user’s information from the API Gateway by making a request to the /user endpoint. It stores the user’s data, such as their name, in state if successfully fetched; otherwise, it resets the user state to null.

```js
function AuthStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/user', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);
```

### API

All requests and responses are routed through the API Gateway, which acts as the central entry point for the system’s microservices. This ensures consistent authentication, routing, and security across all services.

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/', // Proxy to API Gateway
  withCredentials: true,             // Include credentials for authentication
});

export default api;
```

## Motorbikes

This is the Motorbikes page, where you can view all available motorbikes along with their name, model, year, and price.

![image](https://github.com/user-attachments/assets/4423ac9f-cbd6-4fa3-b5b1-af166c51a11f)

### Create Motorbike

You can easily add a new motorbike by entering the details in the form provided at the top.

![image](https://github.com/user-attachments/assets/fea35820-4393-49a6-9ec4-70f8d25bbb7e)

![image](https://github.com/user-attachments/assets/3a44e30b-4c70-400d-969c-db5a4c5f697c)

### Edit Motorbike

Click the edit button on any table row to update the details of the selected motorbike. Change what is necessary and save it.

![image](https://github.com/user-attachments/assets/5e3d1e05-19e3-4542-8810-9d25c44d31b3)

![image](https://github.com/user-attachments/assets/133385a3-da8f-4b19-8375-6ad109713f6b)

### Delete Motorbike

To delete a motorbike, simply click the delete button to remove it from the list.

![image](https://github.com/user-attachments/assets/788af213-167b-49d2-a235-9ab91591a037)

![image](https://github.com/user-attachments/assets/28dd0c66-e9e1-49ae-b15e-67a5fbb47b6d)

### Functions

All essential CRUD operations for Motorbikes are implemented in **Motorbike.jsx**.

```js
  const fetchMotorbikes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/motorbikes');
      setMotorbikes(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch motorbikes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMotorbikes();
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/motorbikes', form);
      setForm({ make: '', model: '', year: '', price: '' });
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike added!', severity: 'success' });
    } catch {
      setError('Failed to add motorbike');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/motorbikes/${id}`);
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete motorbike';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEditOpen = (motorbike) => {
    setEditMotorbike(motorbike);
    setForm({ make: motorbike.make, model: motorbike.model, year: motorbike.year, price: motorbike.price });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditMotorbike(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/motorbikes/${editMotorbike.id}`, form);
      fetchMotorbikes();
      setSnackbar({ open: true, message: 'Motorbike updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update motorbike';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
```

## Clients

This is the Clients page, where you can view all clients along with their name, email, phone number, and address.

![image](https://github.com/user-attachments/assets/95241678-5de2-430c-aaf8-1cc203f6af61)

### Create Client

You can easily add a new client by entering the clients details in the form provided at the top.

![image](https://github.com/user-attachments/assets/6c2b9ec9-6ed3-4608-925b-9b9450dffeef)

![image](https://github.com/user-attachments/assets/098b6338-3404-46d4-8f46-cee22146f67b)

### Edit Client

Click the edit button on any table row to update the details of the selected client. Change what is necessary and save it.

![image](https://github.com/user-attachments/assets/e58475a4-15e5-4caf-92ba-41a3ed797d3e)

![image](https://github.com/user-attachments/assets/040b3de1-7d3e-44e4-b220-2d97582c1d24)

### Delete Client

To delete a client, simply click the delete button to remove it from the list.

![image](https://github.com/user-attachments/assets/1bea7aef-b93e-4606-a908-275d7b047e5c)

![image](https://github.com/user-attachments/assets/0b6cfb9e-f1f6-4217-b719-638d8f1908dc)

### Functions

All essential CRUD operations for Clients are implemented in **Clients.jsx**.

```js
const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch clients');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/clients', form);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchClients();
      setSnackbar({ open: true, message: 'Client added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEditOpen = (client) => {
    setEditClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditClient(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/clients/${editClient.id}`, form);
      fetchClients();
      setSnackbar({ open: true, message: 'Client updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
      setSnackbar({ open: true, message: 'Client deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete client';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
```

## Reservations

This is the Reservations page, where you can view all reservations along with their client, motorbike, reservation date and  start and end date.

![image](https://github.com/user-attachments/assets/c99a602c-b587-4c6b-8c64-8e132920bebf)

### Create Reservation

You can easily add a new reservation by entering the clients details in the form provided at the top.

![image](https://github.com/user-attachments/assets/d24dfd8d-a65c-4ab6-aa3e-e2ce8115c1a4)

![image](https://github.com/user-attachments/assets/8b018c00-94a7-47f6-903e-cfc7c09c32cf)


### Edit Reservation

Click the edit button on any table row to update the details of the selected reservation. Change what is necessary and save it.

![image](https://github.com/user-attachments/assets/5bcab21e-b40c-4b3e-9e76-5757f33e0e71)

![image](https://github.com/user-attachments/assets/eb6afeb3-6fd2-422e-b870-e14127c3b71f)

### Reservation details

Click the details button on any table row to view the details of the selected reservation.

![image](https://github.com/user-attachments/assets/0146cb0e-1b72-4b57-92eb-dc2b501a6e17)

### Delete Reservation

To delete a reservation, simply click the delete button to remove it from the list.

![image](https://github.com/user-attachments/assets/430ad622-6068-470e-afe5-3c2cbe011f67)

![image](https://github.com/user-attachments/assets/87627a0b-c643-454c-845e-5df8d4922c5a)

### Functions

All essential CRUD operations for Reservations are implemented in **Reservations.jsx**.

```js
const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations');
      setReservations(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reservations');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
    api.get('/clients').then(res => setClients(res.data)).catch(() => setClients([]));
    api.get('/motorbikes').then(res => setMotorbikes(res.data)).catch(() => setMotorbikes([]));
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/reservations', form);
      setForm({ clientId: '', motorbikeId: '', reservationDate: '', startDate: '', endDate: '' });
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const res = await api.get(`/reservations/${id}/details`);
      setDetails(res.data);
      setDetailsOpen(true);
    } catch {
      setError('Failed to fetch reservation details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetails(null);
  };

  const handleEditOpen = (reservation) => {
    setEditReservation(reservation);
    setForm({
      clientId: reservation.clientId,
      motorbikeId: reservation.motorbikeId,
      reservationDate: reservation.reservationDate,
      startDate: reservation.startDate,
      endDate: reservation.endDate
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditReservation(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/reservations/${editReservation.id}`, form);
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
      setSnackbar({ open: true, message: 'Reservation deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete reservation';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
```

## Payments

This is the Payments page, where you can view all payments along with their reservation, amount, date and payment status.

![image](https://github.com/user-attachments/assets/520cd704-ce9d-415a-b649-6cb48e2d00b6)


### Create Payment

You can easily add a new payment by entering the payment details in the form provided at the top.

![image](https://github.com/user-attachments/assets/86b87e8b-bf03-4717-9066-605cba7c1926)

![image](https://github.com/user-attachments/assets/971aa376-034e-40a2-9919-142a4fae3486)


### Edit Payment

Click the edit button on any table row to update the details of the selected payment. Change what is necessary and save it.

![image](https://github.com/user-attachments/assets/a32afbff-ca52-47a2-86d8-e37523f6d22c)

![image](https://github.com/user-attachments/assets/a80d19d5-f0c0-43da-b63c-3bcf51c42f41)

### Payment details

Click the details button on any table row to view the details of the selected payment.

![image](https://github.com/user-attachments/assets/6fd858ff-c640-4967-8cc7-3bcb2580b1d8)


### Delete Payment

To delete a payment, simply click the delete button to remove it from the list.

![image](https://github.com/user-attachments/assets/21ddb478-8b30-46b7-9787-0adb87a2da55)

![image](https://github.com/user-attachments/assets/b9bcbb3f-0f0a-4152-9d4d-16f0473390ba)


### Functions

All essential CRUD operations for Payments are implemented in **Payments.jsx**.

```js
const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    fetch('http://localhost:8080/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setUser(data);
        else setUser(null);
      });
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await api.post('/payments', form);
      setForm({ reservationId: '', amount: '', paymentDate: '', status: '' });
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment added!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to add payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleShowDetails = async (id) => {
    try {
      const res = await api.get(`/payments/${id}/details`);
      setDetails(res.data);
      setDetailsOpen(true);
    } catch {
      setError('Failed to fetch payment details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setDetails(null);
  };

  const handleEditOpen = (payment) => {
    setEditPayment(payment);
    setForm({
      reservationId: payment.reservationId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      status: payment.status
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditPayment(null);
  };

  const handleEditSave = async () => {
    try {
      await api.put(`/payments/${editPayment.id}`, form);
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment updated!', severity: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data || 'Failed to update payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
      setSnackbar({ open: true, message: 'Payment deleted!', severity: 'success' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to delete payment';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };
```
