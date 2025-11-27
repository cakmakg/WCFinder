// hook/useCrudCall.jsx
import {
  fetchStart,
  getSuccess,
  fetchFail,
} from "../features/crudSlice";
import useApiCall from "./useApiCall";

const useCrudCall = () => {
  const apiCall = useApiCall();

  const getCrudData = async (url, requiresAuth = false, limit = null) => {
    // Limit parametresi ekle (business listesi için tüm kayıtları getirmek için)
    const urlWithParams = limit ? `/${url}?limit=${limit}` : `/${url}`;
    
    await apiCall({
      url: urlWithParams,
      method: "get",
      startAction: fetchStart,
      successAction: (data) => getSuccess({ url, data }),
      errorAction: fetchFail,
      requiresAuth, // ✅ Auth gerektirip gerektirmediğini belirt
    });
  };

  return { getCrudData };
};

export default useCrudCall;