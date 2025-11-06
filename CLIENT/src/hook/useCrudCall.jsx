// hook/useCrudCall.jsx
import {
  fetchStart,
  getSuccess,
  fetchFail,
} from "../features/crudSlice";
import useApiCall from "./useApiCall";

const useCrudCall = () => {
  const apiCall = useApiCall();

  const getCrudData = async (url) => {
    await apiCall({
      url: `/${url}`,
      method: "get",
      startAction: fetchStart,
      successAction: (data) => getSuccess({ url, data }),
      errorAction: fetchFail,
    });
  };

  return { getCrudData };
};

export default useCrudCall;