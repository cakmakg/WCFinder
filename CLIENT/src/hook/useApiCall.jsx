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
    
    // ✅ startAction optional - sadece tanımlıysa dispatch et
    if (startAction) {
      dispatch(startAction());
    }
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
          response = await axiosInstance[method.toLowerCase()](url, body);
        }
      } catch (requestError) {
        // ✅ Request hatası (network, timeout, vb.)
        // ✅ 204 No Content durumunda axios hata fırlatmaz, bu normal bir response'dur
        // Ama eğer gerçek bir hata varsa (network, 4xx, 5xx), onu yakalayalım
        console.error("❌ [useApiCall] Request failed:", {
          error: requestError,
          message: requestError.message,
          response: requestError.response?.data,
          status: requestError.response?.status,
          config: requestError.config
        });
        throw requestError; // Re-throw to be caught by outer catch
      }
      
      const { data } = response;
      const status = response.status;
      
      if (import.meta.env.DEV) {
        console.log(`✅ API Call Success [${method.toUpperCase()} ${url}]:`, { status, data });
      }
      
      // ✅ 204 No Content durumunda data boş olabilir, bu normaldir
      if (status === 204) {
        // 204 No Content - başarılı ama body yok
        if (import.meta.env.DEV) {
          console.log(`✅ 204 No Content - Success without body [${method.toUpperCase()} ${url}]`);
        }
        if (successAction) {
          dispatch(successAction(null));
        }
        if (successMessage) {
          toastSuccessNotify(successMessage);
        }
        // ✅ 204 durumunda null döndür (başarılı)
        return null;
      }
      
      // ✅ Error kontrolü: Backend bazen { error: false, ... } formatında dönebilir
      if (data?.error === true) {
        console.error(`❌ [useApiCall] Backend returned error:`, data);
        const message = data?.message || errorMessage || "Bir hata oluştu.";
        dispatch(errorAction());
        toastErrorNotify(message);
        throw new Error(message);
      }
      
      if (successAction) {
        dispatch(successAction(data));
      }
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
      let message = null;
      
      // ✅ Önce backend'den gelen mesajı kontrol et
      if (responseData?.message) {
        message = responseData.message;
      } else if (status === 401) {
        message = "Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.";
      } else if (status === 403) {
        message = "Bu işlem için yetkiniz bulunmamaktadır.";
      } else if (status === 404) {
        message = "İstenen kaynak bulunamadı.";
      } else if (status === 500) {
        message = "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.";
      } else {
        // ✅ Genel hata mesajı sadece errorMessage parametresi varsa kullan
        message = errorMessage || error.message || "Bir hata oluştu.";
      }
      
      // ✅ Error action'ı sadece tanımlıysa dispatch et
      if (errorAction) {
        dispatch(errorAction());
      }
      
      // ✅ Error message'ı sadece errorMessage parametresi tanımlıysa toast göster
      // Eğer errorMessage null ise, toast gösterme (hatayı çağıran fonksiyon kendisi handle edecek)
      if (errorMessage !== null && errorMessage !== undefined && message) {
        toastErrorNotify(message);
      }
      
      // ✅ Error'u throw et ama message'ı error objesine ekle
      const enhancedError = new Error(message);
      enhancedError.response = error.response;
      enhancedError.status = status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  };

  return apiCall;
};

export default useApiCall;