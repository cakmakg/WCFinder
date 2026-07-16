// shared/utils/apiClient.js
// Centralized API client configuration

import axios from "axios";
import { API_BASE_URL, attachAuthInterceptors } from "../../utils/authSession";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token ekleme + 401'de refresh/oturum temizliği merkezi olarak yönetiliyor
attachAuthInterceptors(apiClient);

export default apiClient;
