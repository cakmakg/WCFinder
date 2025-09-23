import { useDispatch } from "react-redux";
import { toastErrorNotify, toastSuccessNotify } from "../helper/ToastNotify";
import useAxios from "./useAxios";

/**
 * API isteklerini yönetmek için genel bir custom hook.
 * Bu hook, istek başlangıcında ve sonunda Redux state'ini günceller,
 * başarı ve hata durumlarında bildirim gösterir.
 *
 * @returns {Function} API isteğini yürüten bir fonksiyon.
 */
const useApiCall = () => {
  const dispatch = useDispatch();
  const { axiosWithToken } = useAxios();

  /**
   * Genel API isteği fonksiyonu.
   * @param {Object} params - İstek parametreleri.
   * @param {string} params.url - İstek yapılacak endpoint.
   * @param {string} [params.method='get'] - HTTP metodu (get, post, put, delete vb.).
   * @param {Object} [params.body=null] - İstek gövdesi (POST, PUT istekleri için).
   * @param {Object} params.startAction - İstek başladığında dispatch edilecek Redux action'ı.
   * @param {Object} params.successAction - İstek başarılı olduğunda dispatch edilecek Redux action'ı.
   * @param {Object} params.errorAction - İstek başarısız olduğunda dispatch edilecek Redux action'ı.
   * @param {string} [params.successMessage] - Başarı durumunda gösterilecek bildirim mesajı.
   * @param {string} [params.errorMessage] - Hata durumunda gösterilecek bildirim mesajı.
   */
  const apiCall = async ({
    url,
    method = 'get',
    body = null,
    startAction,
    successAction,
    errorAction,
    successMessage,
    errorMessage,
  }) => {
    dispatch(startAction());
    try {
      const { data } = await axiosWithToken.request({
  method: method,
  url: url,
  data: body,
});
      dispatch(successAction(data));
      if (successMessage) {
        toastSuccessNotify(successMessage);
      }
      return data; // Dönen veriyi de döndürelim, belki component'te ihtiyacımız olur.
    } catch (error) {
      const message = error?.response?.data?.message || errorMessage || "Bir hata oluştu.";
      dispatch(errorAction());
      toastErrorNotify(message);
      // Hata durumunda da hatayı yakalamak için fırlatalım.
      throw error;
    }
  };

  return apiCall;
};

export default useApiCall;