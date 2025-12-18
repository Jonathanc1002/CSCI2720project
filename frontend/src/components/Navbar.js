import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as logoutAPI } from '../services/authService';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutAPI();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          CSCI2720 Events
        </Link>

        <div className="navbar-menu">
          <Link 
            to="/locations" 
            className={`nav-link ${isActive('/locations') ? 'active' : ''}`}
          >
            Locations
          </Link>

          <Link 
            to="/map" 
            className={`nav-link ${isActive('/map') ? 'active' : ''}`}
          >
            Map View
          </Link>

          {isLoggedIn && (
            <>
              <Link 
                to="/favorites" 
                className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
              >
                Favorites
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  Admin Panel
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isLoggedIn ? (
            <>
              <span className="username">Welcome, {user?.username}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
