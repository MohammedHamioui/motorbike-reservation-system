# Motorbike Reservation System Frontend

This is a modern React + Vite + Material-UI frontend for the Motorbike Reservation System microservices project.

## Features
- Professional, responsive UI with Material-UI
- Navigation for Motorbikes, Clients, Reservations, and Payments
- Ready for integration with your API Gateway
- Containerized with Docker for easy deployment

## Getting Started

### Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Docker Usage
1. Build the Docker image:
   ```bash
   docker build -t motorbike-frontend .
   ```
2. Run the container:
   ```bash
   docker run -p 80:80 motorbike-frontend
   ```

### With Docker Compose
Add the following service to your `docker-compose.yml`:
```yaml
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - api-gateway
```

## API Integration
- The frontend expects the backend API Gateway to be available at `/api`.
- Update `vite.config.js` if your API Gateway runs on a different host/port.

## Extending the Frontend
- Implement CRUD and business logic in the respective pages in `src/`.
- Use Axios for API calls and Material-UI components for UI.

---

**Enjoy your professional, containerized frontend!** 