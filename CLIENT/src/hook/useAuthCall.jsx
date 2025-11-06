// hook/useAuthCall.jsx - FIXED VERSION
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchStart,
  loginSuccess,
  registerSuccess,
  fetchFail,
  logoutSuccess,
} from "../features/authSlice";
import useApiCall from "./useApiCall";

const useAuthCall = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiCall = useApiCall();

  const login = async (userInfo) => {
    try {
      const data = await apiCall({
        url: "/auth/login",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: loginSuccess,
        errorAction: fetchFail,
        successMessage: "Giriş işlemi başarılı.",
        requiresAuth: false, // ✅ ÖNEMLİ: Login için token gerekmez!
      });
      
      console.log('🔐 Login response:', data);
      
      if (data?.bearer?.accessToken || data?.token) {
        setTimeout(() => navigate("/"), 100); // ✅ "/" route'una git
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userInfo) => {
    try {
      const data = await apiCall({
        url: "/users",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: registerSuccess,
        errorAction: fetchFail,
        successMessage: "Kayıt işlemi başarılı.",
        requiresAuth: false, // ✅ ÖNEMLİ: Register için de token gerekmez!
      });
      
      navigate("/login");
      return data;
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiCall({
        url: "/auth/logout",
        method: "get",
        startAction: fetchStart,
        successAction: logoutSuccess,
        errorAction: fetchFail,
        successMessage: "Çıkış işlemi başarılı.",
        requiresAuth: true, // ✅ Logout için token gerekir
      });
    } catch (error) {
      console.error('❌ Logout API failed:', error);
      // API başarısız olsa bile kullanıcıyı çıkart
      dispatch(logoutSuccess());
    } finally {
      navigate("/login");
    }
  };

  return { login, register, logout };
};

export default useAuthCall;