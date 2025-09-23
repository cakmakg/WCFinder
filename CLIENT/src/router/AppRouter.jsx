import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import PrivateRouter from './PrivateRouter';
import BusinessList from '../pages/BusinessList';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRouter />}>
          {/* Kök yol (/) artık Home layout'unu kullanıyor */}
          <Route path="/" element={<Home />}>
            {/* Ve ana sayfa olarak ana içerik alanında Dashboard'u (haritayı) gösteriyor */}
            <Route index element={<Dashboard />} />
            
            {/* İleride başka ana sayfa içerikleri istersen buraya ekleyebilirsin */}
            {/* Örnek: <Route path="stats" element={<Statistics />} /> */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRouter;