import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRouter = () => {

  const {currentUser}=useSelector((state)=>state.auth)

  // console.log(currentUser);

  return currentUser ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRouter;
