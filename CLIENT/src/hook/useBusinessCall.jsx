// // hooks/useBusinessCall.jsx (DOĞRU VE SADELEŞTİRİLMİŞ HALİ)

// import { useDispatch,useSelector  } from "react-redux";
// import { useCallback } from "react";
// import useAxios from "./useAxios";
// import { toastErrorNotify, toastSuccessNotify } from "../helper/ToastNotify";
// import {
//   fetchStart,
//   fetchFail,
//   getBusinessesSuccess,
//   getBusinessDetailSuccess,
// } from "../features/crudSlice"; // Yazım hatası düzeltildi

// // Hook adındaki yazım hatası düzeltildi
// const useBusinessCall = () => {
//   const dispatch = useDispatch();
//   const { axiosWithToken } = useAxios();
//   const { token } = useSelector((state) => state.auth);
// console.log("💡 1. FRONTEND: Hook'taki token mevcut mu?", { token });

//   const getBusinesses = useCallback(async () => {
//   console.log("Token:", token); // Debug için
//   dispatch(fetchStart());
//   try {
//     const { data } = await axiosWithToken.get("businesses");
//     dispatch(getBusinessesSuccess(data.result));
//   } catch (error) {
//     console.error("API Error:", error.response?.data); // Debug için
//     dispatch(fetchFail());
//     toastErrorNotify("İşletmeler çekilemedi.");
//   }
// }, [dispatch, axiosWithToken, token]); // token'ı dependency'e ekleyin

//   const getBusinessDetail = useCallback(async (id) => {
//     dispatch(fetchStart());
//     try {
//       const { data } = await axiosWithToken.get(`businesses/${id}`);
//       dispatch(getBusinessDetailSuccess(data.result));
//     } catch (error) {
//       dispatch(fetchFail());
//       toastErrorNotify("İşletme detayı çekilemedi.");
//     }
//   }, [dispatch, axiosWithToken]);

//   // DÜZELTME: Bu fonksiyonlar artık getBusinesses'a bağımlı değil.
//   // Başarılı olduklarında, listeyi yenilemek için getBusinesses'ı kendileri çağırır.
//   // Bu, useCallback bağımlılık zincirini kırar ve döngüyü önler.
  
//   const createBusiness = async (businessInfo) => {
//     dispatch(fetchStart());
//     try {
//       await axiosWithToken.post("businesses", businessInfo);
//       toastSuccessNotify("İşletme başarıyla oluşturuldu.");
//       getBusinesses(); // Liste'yi yenile
//     } catch (error) {
//       dispatch(fetchFail());
//       toastErrorNotify("İşletme oluşturulamadı.");
//     }
//   };

//   const updateBusiness = async (businessInfo) => {
//     dispatch(fetchStart());
//     try {
//       await axiosWithToken.put(`businesses/${businessInfo._id}`, businessInfo);
//       toastSuccessNotify("İşletme başarıyla güncellendi.");
//       getBusinesses(); // Liste'yi yenile
//     } catch (error) {
//       dispatch(fetchFail());
//       toastErrorNotify("İşletme güncellenemedi.");
//     }
//   };
  
//   const deleteBusiness = async (id) => {
//     dispatch(fetchStart());
//     try {
//       await axiosWithToken.delete(`businesses/${id}`);
//       toastSuccessNotify("İşletme başarıyla silindi.");
//       getBusinesses(); // Liste'yi yenile
//     } catch (error) {
//       dispatch(fetchFail());
//       toastErrorNotify("İşletme silinemedi.");
//     }
//   };

//   return {
//     getBusinesses,
//     getBusinessDetail,
//     createBusiness,
//     updateBusiness,
//     deleteBusiness,
//   };
// };

// export default useBusinessCall;