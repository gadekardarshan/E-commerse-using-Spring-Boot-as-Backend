import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart, updateCartQuantity, removeFromCart, clearCart } from '../api/cartApi';
import type { CartResponse } from '../types/cart';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const navigate = useNavigate();

  const fetchUserCart = async () => {
    if (!user) {
      setError('Please log in to view your cart.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const cartData = await getCart(user.id);
      setCart(cartData);
    } catch (err: unknown) {
      // If cart is not created yet (404/500/etc.), we can display empty cart state
      setCart({ id: 0, userId: user.id, items: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCart();
  }, [user]);

  const handleUpdateQuantity = async (productId: number, currentQty: number, change: number) => {
    if (!user) return;
    const newQty = currentQty + change;
    
    setUpdatingItemId(productId);
    try {
      const updatedCart = await updateCartQuantity(user.id, productId, newQty);
      setCart(updatedCart);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update quantity.');
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!user) return;
    if (!window.confirm('Remove this item from your cart?')) return;

    setUpdatingItemId(productId);
    try {
      const updatedCart = await removeFromCart(user.id, productId);
      setCart(updatedCart);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to remove item.');
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!user) return;
    if (!window.confirm('Clear all items from your cart?')) return;

    setIsLoading(true);
    try {
      await clearCart(user.id);
      setCart({ id: 0, userId: user.id, items: [] });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to clear cart.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrandTotal = (): number => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Your Shopping Cart</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Review and manage your purchase items</p>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="btn logout-btn" 
          style={{ 
            borderColor: 'rgba(255,255,255,0.2)', 
            color: 'var(--text-secondary)', 
            width: 'auto',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px' }}>Loading your shopping cart...</p>
        </div>
      ) : !cart || !cart.items || cart.items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px solid var(--card-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <ShoppingBag className="w-16 h-16 text-purple-400 opacity-60" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Your cart is empty</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Browse our catalogue to add electronic products to your cart.
          </p>
          <button onClick={() => navigate('/')} className="btn" style={{ maxWidth: '200px', margin: '0 auto', cursor: 'pointer' }}>
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content-card" style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-main)'
        }}>
          {/* Cart items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
            {cart.items.map((item) => (
              <div 
                key={item.productId} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {/* Product image */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  background: 'white',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  flexShrink: 0
                }}>
                  <img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                
                {/* Details */}
                <div style={{ flexGrow: 1, marginRight: '20px' }}>
                  <h3 
                    style={{ fontSize: '1rem', fontWeight: 600, color: 'white', cursor: 'pointer', marginBottom: '6px' }}
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.title}
                  </h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${item.price.toFixed(2)}</span>
                </div>

                {/* Quantity Adjuster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '32px' }}>
                  <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                    disabled={updatingItemId === item.productId || item.quantity <= 1}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                    disabled={updatingItemId === item.productId}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ minWidth: '90px', textAlign: 'right', marginRight: '24px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  disabled={updatingItemId === item.productId}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer summary */}
          <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={handleClearCart}
              style={{
                background: 'none',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '10px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
            >
              Clear Cart
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>Grand Total:</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>${calculateGrandTotal().toFixed(2)}</span>
              </div>
              
              <button 
                className="btn" 
                style={{ width: '240px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 600 }} 
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default CartPage;
