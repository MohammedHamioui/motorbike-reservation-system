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

#### GET /reservations/{id}

#### GET /reservations/{id}/details

#### POST /reservations

#### PUT /reservations/{id}

#### DELETE /reservations/{id}


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

#### GET /payments/{id}

#### GET /payments/{id}/details

#### POST /payments

#### PUT /payments/{id}

#### DELETE /payments/{id}


## Unit Tests
How to run tests, coverage, etc.

## Front-end
