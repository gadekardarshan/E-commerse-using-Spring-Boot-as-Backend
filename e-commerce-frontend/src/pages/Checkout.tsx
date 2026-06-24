import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCart } from '../api/cartApi';
import { placeOrder } from '../api/orderApi';
import type { CartResponse } from '../types/cart';
import { MapPin, Phone, ShoppingCart, CreditCard } from 'lucide-react';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCartDetails = async () => {
      if (!user) return;
      try {
        const cartData = await getCart(user.id);
        setCart(cartData);
      } catch (err) {
        setError('Your shopping cart is empty.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartDetails();
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress.trim() || !phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!user) return;
    setIsSubmitting(true);
    try {
      await placeOrder(user.id, shippingAddress, phone);
      navigate('/orders');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to place order.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateGrandTotal = (): number => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
        <p>Loading checkout details...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Your cart is empty. Cannot checkout.</p>
        <button onClick={() => navigate('/')} className="btn" style={{ maxWidth: '200px', margin: '20px auto 0 auto' }}>Go to Shop</button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      <header className="products-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Secure Checkout</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Provide delivery details and complete your order</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Shipping Form */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-main)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-5 h-5 text-purple-400" />
            Shipping Details
          </h2>

          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label" htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                className="form-input"
                placeholder="123 Main St, Apartment 4B, New York, NY 10001"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={isSubmitting}
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone className="w-5 h-5 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Payment terms */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ color: '#34d399' }}>Cash on Delivery (COD)</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Pay for your purchase when it arrives at your doorstep.</p>
              </div>
            </div>

            <button type="submit" className="btn" disabled={isSubmitting} style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'white',
              background: 'var(--btn-gradient)',
              transition: 'opacity 0.2s',
              height: '48px'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}>
              {isSubmitting ? 'Processing Order...' : `Place COD Order ($${calculateGrandTotal().toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-main)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, width: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total amount:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
