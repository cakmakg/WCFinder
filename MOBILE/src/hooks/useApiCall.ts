/**
 * useApiCall Hook for React Native
 * 
 * Generic API call hook with Redux integration
 * Handles loading states, success/error actions, and toast notifications
 */

import { useDispatch } from 'react-redux';
import { toastErrorNotify, toastSuccessNotify } from '../helper/toastNotify';
import useAxios from './useAxios';

interface ApiCallOptions {
  url: string;
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  body?: any;
  startAction?: () => any;
  successAction?: (data: any) => any;
  errorAction?: () => any;
  successMessage?: string;
  errorMessage?: string | null;
  requiresAuth?: boolean;
}

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
    requiresAuth = true,
  }: ApiCallOptions) => {
    console.log("🚀 [useApiCall] Starting API call:", {
      url,
      method: method.toUpperCase(),
      requiresAuth,
      body: body ? maskSensitiveData(body) : null,
    });
    
    // Start action (optional)
    if (startAction) {
      dispatch(startAction());
    }
    
    try {
      // Select axios instance based on auth requirement
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
          console.log("📡 [useApiCall] Making request:", method.toLowerCase(), url, "with body:", maskSensitiveData(body));
          response = await axiosInstance[method.toLowerCase()](url, body);
        }
      } catch (requestError: any) {
        console.error("❌ [useApiCall] Request failed:", {
          error: requestError,
          message: requestError.message,
          response: requestError.response?.data,
          status: requestError.response?.status,
        });
        throw requestError;
      }
      
      const { data } = response;
      const status = response.status;
      
      console.log(`✅ API Call Success [${method.toUpperCase()} ${url}]:`, { status, data });
      
      // Handle 204 No Content
      if (status === 204) {
        console.log(`✅ 204 No Content - Success without body [${method.toUpperCase()} ${url}]`);
        if (successAction) {
          dispatch(successAction(null));
        }
        if (successMessage) {
          toastSuccessNotify(successMessage);
        }
        return null;
      }
      
      // Check for backend error flag
      if (data?.error === true) {
        console.error(`❌ [useApiCall] Backend returned error:`, data);
        const message = data?.message || errorMessage || "Bir hata oluştu.";
        if (errorAction) {
          dispatch(errorAction());
        }
        toastErrorNotify(message);
        throw new Error(message);
      }
      
      // Success
      if (successAction) {
        dispatch(successAction(data));
      }
      if (successMessage) {
        toastSuccessNotify(successMessage);
      }
      return data;
    } catch (error: any) {
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
        message: error.message,
      });
      
      // Get error message
      let message: string | null = null;
      
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
        message = errorMessage || error.message || "Bir hata oluştu.";
      }
      
      // Error action
      if (errorAction) {
        dispatch(errorAction());
      }
      
      // Show error toast (only if errorMessage is not null/undefined)
      if (errorMessage !== null && errorMessage !== undefined && message) {
        toastErrorNotify(message);
      }
      
      // Throw enhanced error
      const enhancedError = new Error(message);
      (enhancedError as any).response = error.response;
      (enhancedError as any).status = status;
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  };

  return apiCall;
};

// Helper function to mask sensitive data
const maskSensitiveData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'passwd', 'pwd', 'token', 'accessToken', 'refreshToken'];
  const masked = { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
};

export default useApiCall;

