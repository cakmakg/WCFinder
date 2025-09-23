import { useNavigate } from "react-router-dom";
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
  const apiCall = useApiCall();

  const login = async (userInfo) => {
    console.log('🔐 Starting login process with:', userInfo);
    
    try {
      const data = await apiCall({
        url: "/auth/login",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: loginSuccess,
        errorAction: fetchFail,
        successMessage: "Giriş işlemi başarılı.",
      });
      
      console.log('✅ Login API response received:', data);
      
      // DEĞİŞİKLİK BURADA: Backend'den gelen doğru alan adını kontrol ediyoruz.
      if (data?.bearer?.accessToken || data?.token) {
        console.log('🎯 Token found, redirecting to dashboard...');
        // Redux state'inin güncellenmesine zaman tanımak için küçük bir gecikme
        // PrivateRouter'ın güncel token'ı görmesini sağlar.
        setTimeout(() => {
          navigate("/home");
        }, 100); 
      } else {
        console.error('❌ No token in response, staying on login page');
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (userInfo) => {
    console.log('📝 Starting register process with:', userInfo);
    
    try {
      const data = await apiCall({
        url: "/users",
        method: "post",
        body: userInfo,
        startAction: fetchStart,
        successAction: registerSuccess,
        errorAction: fetchFail,
        successMessage: "Kayıt işlemi başarılı.",
      });
      
      console.log('✅ Register API response received:', data);
      navigate("/login");
      return data;
      
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process');
    
    try {
      await apiCall({
        url: "/auth/logout",
        method: "post",
        startAction: fetchStart,
        successAction: logoutSuccess,
        errorAction: fetchFail,
        successMessage: "Çıkış işlemi başarılı.",
      });
      navigate("/");
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  return { login, register, logout };
};

export default useAuthCall;