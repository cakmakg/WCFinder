// src/hooks/useAxios.jsx

import axios from "axios";
import { useSelector } from "react-redux";

const useAxios = () => {
  const { token } = useSelector((state) => state.auth);
  
  // Backend'den gelen Authorization başlığı formatına göre düzenleyin
  // Örneğin: "Bearer" veya "Token"
  const axiosWithToken = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}` 
    },
  });

  const axiosWithoutHeader = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
  });

  return { axiosWithToken, axiosWithoutHeader };
};

export default useAxios;