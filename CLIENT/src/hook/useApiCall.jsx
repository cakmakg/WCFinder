// hook/useApiCall.jsx
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
    requiresAuth = true,
  }) => {
    if (import.meta.env.DEV) {
      console.log("🚀 [useApiCall] Starting:", method.toUpperCase(), url);
    }

    if (startAction) {
      dispatch(startAction());
    }
    try {
      const axiosInstance = requiresAuth ? axiosWithToken : axiosPublic;

      let response;

      try {
        if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
          response = await axiosInstance[method.toLowerCase()](url);
        } else {
          response = await axiosInstance[method.toLowerCase()](url, body);
        }
      } catch (requestError) {
        if (import.meta.env.DEV) {
          console.error("❌ [useApiCall] Request failed:", {
            message: requestError.message,
            status: requestError.response?.status,
            url,
          });
        }
        throw requestError;
      }

      const { data } = response;
      const status = response.status;

      if (import.meta.env.DEV) {
        console.log(`✅ API Call Success [${method.toUpperCase()} ${url}]:`, status);
      }

      if (status === 204) {
        if (successAction) dispatch(successAction(null));
        if (successMessage) toastSuccessNotify(successMessage);
        return null;
      }

      if (data?.error === true) {
        if (import.meta.env.DEV) console.error(`❌ [useApiCall] Backend error:`, data?.message);
        const message = data?.message || errorMessage || "Ein Fehler ist aufgetreten.";
        dispatch(errorAction());
        toastErrorNotify(message);
        throw new Error(message);
      }

      if (successAction) dispatch(successAction(data));
      if (successMessage) toastSuccessNotify(successMessage);
      return data;
    } catch (error) {
      const status = error.response?.status;
      const responseData = error.response?.data;

      if (import.meta.env.DEV) {
        console.error(`❌ [useApiCall] Failed [${method.toUpperCase()} ${url}]:`, {
          status,
          message: error.message,
        });
      }

      let message = null;
      if (responseData?.message) {
        message = responseData.message;
      } else if (status === 401) {
        message = "Benutzername oder Passwort ist falsch. Bitte versuchen Sie es erneut.";
      } else if (status === 403) {
        message = "Sie sind nicht berechtigt, diese Aktion auszuführen.";
      } else if (status === 404) {
        message = "Die angeforderte Ressource wurde nicht gefunden.";
      } else if (status === 500) {
        message = "Serverfehler. Bitte versuchen Sie es später erneut.";
      } else {
        message = errorMessage || error.message || "Ein Fehler ist aufgetreten.";
      }

      if (errorAction) dispatch(errorAction());
      if (errorMessage !== null && errorMessage !== undefined && message) {
        toastErrorNotify(message);
      }

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
