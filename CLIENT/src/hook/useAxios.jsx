// src/hooks/useAxios.jsx

import axios from "axios";
import { useSelector } from "react-redux";

  const useAxios = () => {
    const { token } = useSelector((state) => state.auth);

    const axiosWithToken = axios.create({
        baseURL: import.meta.env.VITE_BASE_URL,
        headers: { Authorization: `Token ${token}` },
    });
    const axiosPublic = axios.create({
    // DEĞİŞİKLİK BURADA
    baseURL: import.meta.env.VITE_BASE_URL,
  });
console.log("💡 2. FRONTEND: Axios isteğe token ekliyor mu?", { header: `Bearer ${token}` });
  return { axiosWithToken, axiosPublic  };
};

export default useAxios;