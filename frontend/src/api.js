import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/', // This will be proxied to your API Gateway
  withCredentials: true,
});

export default api;