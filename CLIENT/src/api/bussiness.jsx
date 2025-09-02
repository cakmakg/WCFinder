import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Backend adresinizi girin
});

export const getBussinesses = () => API.get('/bussiness');
export const createBussiness = (data) => API.post('/bussiness', data);
export const getBussinessDetails = (id) => API.get(`/bussiness/${id}`);
// ... diğer CRUD fonksiyonları