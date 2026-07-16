// CLIENT/src/services/api.js

import axios from 'axios';
import { API_BASE_URL, attachAuthInterceptors } from '../utils/authSession';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(api);

export default api;
