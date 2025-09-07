import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import PrivateRouter from './PrivateRouter';


const AppRouter=()=> {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="register" element={<Register />} /> 
        <Route path="/" element={<PrivateRouter />} />
        <Route path='home' element={<Home />} />
        <Route path='dashboard' element={<Dashboard />} />
        
        
        

      </Routes>
    </Router>
  );
}

export default AppRouter;