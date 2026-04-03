import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { FiShoppingCart, FiUser, FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚽</span>
          <span>Escobar</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/ready-made" onClick={() => setMenuOpen(false)}>Ready-Made</Link>

          {user ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-admin" onClick={() => setMenuOpen(false)}>
                  <FiSettings size={14} /> Admin
                </Link>
              )}
              <Link to="/cart" className="nav-cart" onClick={() => setMenuOpen(false)}>
                <FiShoppingCart size={18} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <div className="nav-user">
                <FiUser size={14} />
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <FiLogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
