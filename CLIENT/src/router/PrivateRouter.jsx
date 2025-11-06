// router/PrivateRouter.jsx
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRouter = () => {
  const { currentUser } = useSelector((state) => state.auth);
  
  return currentUser ? <Outlet /> : <Navigate to="/login" />; // ✅ /login'e yönlendir
};

export default PrivateRouter;