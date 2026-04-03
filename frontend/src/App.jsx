import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from './store/cartSlice';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Designer from './pages/Designer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ReadyMade from './pages/ReadyMade';

import AdminDashboard from './pages/admin/Dashboard';
import AdminTemplates from './pages/admin/Templates';
import AdminOrders from './pages/admin/Orders';
import AdminReadyMade from './pages/admin/ReadyMade';

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Hydrate cart on page refresh when user is already logged in
  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#16213e', color: '#eaeaea', border: '1px solid #2d3748' },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/ready-made" element={<ReadyMade />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/designer/:jerseyId" element={<Designer />} />
          <Route path="/designer/:jerseyId/edit/:designId" element={<Designer />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/templates" element={<AdminTemplates />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/ready-made" element={<AdminReadyMade />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
