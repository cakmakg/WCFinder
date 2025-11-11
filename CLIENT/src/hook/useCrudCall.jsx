// hook/useCrudCall.jsx
import {
  fetchStart,
  getSuccess,
  fetchFail,
} from "../features/crudSlice";
import useApiCall from "./useApiCall";

const useCrudCall = () => {
  const apiCall = useApiCall();

  const getCrudData = async (url, requiresAuth = false) => {
    await apiCall({
      url: `/${url}`,
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