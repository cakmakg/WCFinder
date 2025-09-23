import axios from "axios";
import { useSelector } from "react-redux";

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);

  // Debug için token'ı kontrol et
  console.log("🔍 Current token in useAxios:", token);

  const axiosWithToken = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: token ? { 
      Authorization: `Bearer ${token}` // Token -> Bearer formatına değiştirildi
    } : {},
  });

  const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
  });

  // Request interceptor - her istekte token kontrolü
  axiosWithToken.interceptors.request.use(
    (config) => {
      console.log("🚀 Making request to:", config.url);
      console.log("🔑 With token:", token ? "✅ Token exists" : "❌ No token");
      return config;
    },
    (error) => {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - hataları yakala
  axiosWithToken.interceptors.response.use(
    (response) => {
      console.log("✅ Response received:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ Response error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
        headers: error.config?.headers
      });
      
      // 401 hatası durumunda
      if (error.response?.status === 401) {
        console.warn("🚪 Unauthorized - Token may be invalid or expired");
        console.warn("Current token:", token ? token.substring(0, 20) + '...' : 'No token');
        
        // Redux store'u temizlemek için dispatch gerekli
        // Bu durumda sadece localStorage'ı temizleyip kullanıcıyı uyarabiliriz
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Kullanıcıyı login'e yönlendir
        alert('Your session has expired. Please login again.');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  return { axiosWithToken, axiosPublic };
};

export default useAxios;