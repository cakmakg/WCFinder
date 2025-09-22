import {
  fetchStart,
  getSuccess,
  fetchFail,
} from "../features/crudSlice";
import useApiCall from "./useApiCall";

/**
 * Genel CRUD API çağrılarını yöneten custom hook.
 * Hangi "slice" ve "endpoint" ile çalışacağını parametre olarak alır.
 */
const useCrudCall = () => {
  const apiCall = useApiCall();

  /**
   * Belirtilen endpoint'ten veri çeker ve ilgili slice'ı günceller.
   * @param {string} url - Veri çekilecek endpoint (örn: "bussiness", "toilets").
   */
  const getCrudData = async (url) => {
    await apiCall({
      url: `/${url}`, // url'i dinamik olarak alıyoruz
      method: "get",
      startAction: fetchStart,
      // Gelen veriyi, hangi endpoint'e ait olduğu bilgisiyle birlikte slice'a gönderiyoruz.
      successAction: (data) => getSuccess({ url, data }),
      errorAction: fetchFail,
    });
  };

  // Diğer CRUD işlemleri de benzer şekilde genele uygun hale getirilebilir.
  // const deleteCrudData = async (url, id) => { ... }
  // const createCrudData = async (url, data) => { ... }

  return { getCrudData };
};

export default useCrudCall;