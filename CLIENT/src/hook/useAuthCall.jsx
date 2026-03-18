// hook/useAuthCall.jsx
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const dispatch = useDispatch();
  const apiCall = useApiCall();

  const login = async (userInfo) => {
    if (import.meta.env.DEV) {
      console.log("🔐 [useAuthCall] Login called for:", userInfo?.username || userInfo?.email);
    }
    try {
      const data = await apiCall({
        url: "/auth/login",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: loginSuccess,
        errorAction: fetchFail,
        successMessage: "Giriş işlemi başarılı.",
        requiresAuth: false,
      });

      if (import.meta.env.DEV) {
        console.log('🔐 Login success, token received:', !!data?.bearer?.accessToken || !!data?.token);
      }

      if (data?.bearer?.accessToken || data?.token) {
        const redirectTo = location.state?.from || '/home';
        setTimeout(() => navigate(redirectTo, { replace: true }), 100);
      }

      return data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('❌ Login failed:', error.message);
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
        requiresAuth: false,
      });

      navigate("/login");
      return data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('❌ Register failed:', error.message);
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
        requiresAuth: true,
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('❌ Logout API failed:', error.message);
      dispatch(logoutSuccess());
    } finally {
      navigate("/");
    }
  };

  return { login, register, logout };
};

export default useAuthCall;
