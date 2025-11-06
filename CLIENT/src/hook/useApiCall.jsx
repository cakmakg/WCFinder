// hook/useApiCall.jsx - FIXED VERSION
import { useDispatch } from "react-redux";
import { toastErrorNotify, toastSuccessNotify } from "../helper/ToastNotify";
import useAxios from "./useAxios";

const useApiCall = () => {
  const dispatch = useDispatch();
  const { axiosWithToken, axiosPublic } = useAxios();

  const apiCall = async ({
    url,
    method = 'get',
    body = null,
    startAction,
    successAction,
    errorAction,
    successMessage,
    errorMessage,
    requiresAuth = true, // ✅ YENİ: Auth gerektirip gerektirmediğini belirt
  }) => {
    dispatch(startAction());
    try {
      // ✅ Auth durumuna göre doğru axios instance'ı seç
      const axiosInstance = requiresAuth ? axiosWithToken : axiosPublic;
      
      let response;
      
      if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
        response = await axiosInstance[method.toLowerCase()](url);
      } else {
        response = await axiosInstance[method.toLowerCase()](url, body);
      }
      
      const { data } = response;
      
      console.log(`✅ API Call Success [${method.toUpperCase()} ${url}]:`, data);
      
      dispatch(successAction(data));
      if (successMessage) {
        toastSuccessNotify(successMessage);
      }
      return data;
    } catch (error) {
      console.error(`❌ API Call Failed [${method.toUpperCase()} ${url}]:`, error.response?.data || error);
      const message = error?.response?.data?.message || errorMessage || "Bir hata oluştu.";
      dispatch(errorAction());
      toastErrorNotify(message);
      throw error;
    }
  };

  return apiCall;
};

export default useApiCall;