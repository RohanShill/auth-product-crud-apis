import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Plus, LogOut, LogIn, UserPlus, User } from 'lucide-react';

const Navbar = ({ onOpenAddModal, currentView, setView }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setView('products')}>
          <div className="brand-icon">
            <ShoppingBag size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">ShopCraft</span>
            <span className="brand-badge">APIs & CRUD</span>
          </div>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenAddModal}
              >
                <Plus size={18} />
                <span>Add Product</span>
              </button>

              <div className="user-profile-badge">
                <div className="avatar-circle">
                  <User size={16} />
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={logout}
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="auth-nav-buttons">
              <button
                type="button"
                className={`btn ${currentView === 'login' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setView('login')}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`btn ${currentView === 'register' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('register')}
              >
                <UserPlus size={16} />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
