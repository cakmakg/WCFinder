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
    console.log("🚀 [useApiCall] Starting API call:", {
      url,
      method: method.toUpperCase(),
      requiresAuth,
      body,
    });
    
    dispatch(startAction());
    try {
      // ✅ Auth durumuna göre doğru axios instance'ı seç
      const axiosInstance = requiresAuth ? axiosWithToken : axiosPublic;
      
      console.log("🔍 [useApiCall] Selected axios instance:", {
        type: requiresAuth ? 'axiosWithToken' : 'axiosPublic',
        baseURL: axiosInstance.defaults.baseURL,
        finalURL: `${axiosInstance.defaults.baseURL}${url}`,
      });
      
      let response;
      
      try {
        if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
          console.log("📡 [useApiCall] Making request:", method.toLowerCase(), url);
          response = await axiosInstance[method.toLowerCase()](url);
        } else {
          console.log("📡 [useApiCall] Making request:", method.toLowerCase(), url, "with body:", body);
          console.log("📡 [useApiCall] Full request details:", {
            method: method.toLowerCase(),
            url: `${axiosInstance.defaults.baseURL}${url}`,
            body: body,
            headers: axiosInstance.defaults.headers
          });
          response = await axiosInstance[method.toLowerCase()](url, body);
        }
      } catch (requestError) {
        // ✅ Request hatası (network, timeout, vb.)
        console.error("❌ [useApiCall] Request failed at line 46:", {
          error: requestError,
          message: requestError.message,
          response: requestError.response?.data,
          status: requestError.response?.status,
          config: requestError.config
        });
        throw requestError; // Re-throw to be caught by outer catch
      }
      
      const { data } = response;
      
      console.log(`✅ API Call Success [${method.toUpperCase()} ${url}]:`, data);
      
      // ✅ Error kontrolü: Backend bazen { error: false, ... } formatında dönebilir
      if (data?.error === true) {
        console.error(`❌ [useApiCall] Backend returned error:`, data);
        const message = data?.message || errorMessage || "Bir hata oluştu.";
        dispatch(errorAction());
        toastErrorNotify(message);
        throw new Error(message);
      }
      
      dispatch(successAction(data));
      if (successMessage) {
        toastSuccessNotify(successMessage);
      }
      return data;
    } catch (error) {
      const fullURL = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown';
      const responseData = error.response?.data;
      const status = error.response?.status;
      
      console.error(`❌ [useApiCall] API Call Failed [${method.toUpperCase()} ${url}]:`, {
        status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: fullURL,
        responseData,
        requestData: error.config?.data,
        message: error.message,
        error: error,
      });
      
      // ✅ Backend'den gelen hata mesajını kullan
      let message = errorMessage || "Bir hata oluştu.";
      
      if (responseData?.message) {
        // Backend'den gelen mesajı kullan
        message = responseData.message;
      } else if (status === 401) {
        message = "Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.";
      } else if (status === 403) {
        message = "Bu işlem için yetkiniz bulunmamaktadır.";
      } else if (status === 404) {
        message = "İstenen kaynak bulunamadı.";
      } else if (status === 500) {
        message = "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
      }
      
      dispatch(errorAction());
      toastErrorNotify(message);
      throw error;
    }
  };

  return apiCall;
};

export default useApiCall;