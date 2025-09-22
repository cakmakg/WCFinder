// src/hooks/useAxios.jsx

import axios from "axios";
import { useSelector } from "react-redux";

  const useAxios = () => {
    const { token } = useSelector((state) => state.auth);

    const axiosWithToken = axios.create({
        baseURL: process.env.REACT_APP_BASE_URL, // .env dosyanızdan
        headers: { Authorization: `Bearer ${token}` }
    });
console.log("💡 2. FRONTEND: Axios isteğe token ekliyor mu?", { header: `Bearer ${token}` });
  return { axiosWithToken, axiosWithoutHeader };
};

export default useAxios;