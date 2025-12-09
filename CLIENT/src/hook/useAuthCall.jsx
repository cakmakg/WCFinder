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

  /**
   * Masks sensitive data (password) before logging
   * @param {object} data - Data to mask
   * @returns {object} - Masked data
   */
  const maskSensitiveData = (data) => {
    if (!data || typeof data !== 'object') return data;
    const safe = { ...data };
    if (safe.password) safe.password = '***REDACTED***';
    return safe;
  };

  const login = async (userInfo) => {
    // ✅ SECURITY: Never log password in plain text
    console.log("🔐 [useAuthCall] Login called with:", maskSensitiveData(userInfo));
    try {
      console.log("🔐 [useAuthCall] Calling apiCall with url: /auth/login");
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
      
      console.log('🔐 Login response:', data);
      
      if (data?.bearer?.accessToken || data?.token) {
        // Login sonrası yönlendirme
        // Eğer location.state.from varsa oraya git, yoksa /home'a git
        const redirectTo = location.state?.from || '/home';
        setTimeout(() => navigate(redirectTo, { replace: true }), 100);
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
        requiresAuth: false,
      });
      
      // Register sonrası login sayfasına yönlendir
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
        requiresAuth: true,
      });
    } catch (error) {
      console.error('❌ Logout API failed:', error);
      dispatch(logoutSuccess());
    } finally {
      // Logout sonrası StartPage'e git
      navigate("/");
    }
  };

  return { login, register, logout };
};

export default useAuthCall;