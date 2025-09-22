import { useNavigate } from "react-router-dom";
import {
  fetchStart,
  loginSuccess,
  registerSuccess,
  fetchFail,
  logoutSuccess,
} from "../features/authSlice";
import useApiCall from "./useApiCall"; // Yeni hook'umuzu import ediyoruz

const useAuthCall = () => {
  const navigate = useNavigate();
  const apiCall = useApiCall(); // Yeni hook'umuzu çağırıyoruz

  const login = async (userInfo) => {
    await apiCall({
      url: "/auth/login",
      method: "post",
      body: userInfo,
      startAction: fetchStart,
      successAction: loginSuccess,
      errorAction: fetchFail,
      successMessage: "Giriş işlemi başarılı.",
    });
    // Başarılı olursa yönlendirmeyi burada yapabiliriz
    navigate("/dashboard");
  };

  const register = async (userInfo) => {
    await apiCall({
      url: "/users",
      method: "post",
      body: userInfo,
      startAction: fetchStart,
      successAction: registerSuccess,
      errorAction: fetchFail,
      successMessage: "Kayıt işlemi başarılı.",
    });
    navigate("/login");
  };

  const logout = async () => {
    await apiCall({
        url: "/auth/logout",
        method: "post",
        startAction: fetchStart,
        successAction: logoutSuccess,
        errorAction: fetchFail,
        successMessage: "Çıkış işlemi başarılı.",
      });
    navigate("/");
  };

  return { login, register, logout };
};

export default useAuthCall;