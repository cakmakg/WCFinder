// src/hooks/useAuthCall.jsx

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchFail, fetchStart, loginSuccess, logoutSuccess, registerSuccess } from "../features/authSlice";
import { toastErrorNotify, toastSuccessNotify } from "../helper/ToastNotify";
import useAxios from "./useAxios";
import axios from "axios";

const useAuthCall = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { axiosWithoutHeader, axiosWithToken } = useAxios();

  const register = async (userInfo) => {
    dispatch(fetchStart());
    try {
      const { data } = await axiosWithoutHeader.post(`/auth/register`, userInfo);
      dispatch(registerSuccess(data));
      navigate("/"); // Kayıt başarılıysa anasayfaya yönlendir
      toastSuccessNotify("Kayıt başarılı.");
    } catch (error) {
      dispatch(fetchFail());
      toastErrorNotify(error?.response?.data?.message || "Kayıt başarısız.");
    }
  };

  const login = async (userInfo) => {
    dispatch(fetchStart());
    try {
      const { data } = await axiosWithoutHeader.post(`/auth/login`, userInfo);
      dispatch(loginSuccess(data));
      navigate("/"); // Giriş başarılıysa anasayfaya yönlendir
      toastSuccessNotify("Giriş başarılı.");
    } catch (error) {
      dispatch(fetchFail());
      toastErrorNotify(error?.response?.data?.message || "Giriş başarısız.");
    }
  };

  const logout = async () => {
    dispatch(fetchStart());
    try {
      await axiosWithToken.post(`/auth/logout`);
      dispatch(logoutSuccess());
      toastSuccessNotify("Çıkış yapıldı.");
      navigate("/"); // Çıkış yapınca anasayfaya yönlendir
    } catch (error) {
      dispatch(fetchFail());
      toastErrorNotify(error?.response?.data?.message || "Çıkış başarısız.");
    }
  };

  return { register, login, logout };
};

export default useAuthCall;