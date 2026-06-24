import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cartApi';
import { 
  ShoppingCart, 
  LogOut, 
  User, 
  Heart, 
  ClipboardList, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  ShoppingBag 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState<number>(0);

  // Fetch cart details on mount or when user changes to count items
  useEffect(() => {
    if (user) {
      getCart(user.id)
        .then((cart) => {
          const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{
      width: '100%',
      background: 'rgba(15, 12, 27, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div className="navbar-inner" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          textDecoration: 'none',
          background: 'linear-gradient(to right, #a78bfa, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'transform 0.2s'
        }}>
          <ShoppingBag className="w-6 h-6 stroke-purple-400" />
          ElectroStore
        </Link>

        {/* Links & Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" className="navbar-link" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            Shop Products
          </Link>

          {user ? (
            <>
              {/* Customer Links */}
              <Link to="/wishlist" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <Heart className="w-4 h-4 text-pink-500" />
                Wishlist
              </Link>

              <Link to="/orders" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <ClipboardList className="w-4 h-4 text-blue-400" />
                My Orders
              </Link>

              {/* Shopping Cart Badge */}
              <Link to="/cart" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem',
                position: 'relative'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <ShoppingCart className="w-4 h-4 text-purple-400" />
                Cart
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    background: 'var(--btn-gradient)',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin Panel Access Link */}
              {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="navbar-link" style={{
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.95rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)')}>
                  <LayoutDashboard className="w-4 h-4 text-purple-300" />
                  Admin Panel
                </Link>
              )}

              {/* Profile Link */}
              <Link to="/profile" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <User className="w-4 h-4" />
                {user.name}
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="navbar-link" style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                fontWeight: 500,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}>
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Not Logged In options */}
              <Link to="/login" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <LogIn className="w-4 h-4" />
                Login
              </Link>

              <Link to="/register" className="navbar-link" style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
