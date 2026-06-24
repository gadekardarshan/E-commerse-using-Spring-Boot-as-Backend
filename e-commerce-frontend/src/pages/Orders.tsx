import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, cancelOrder } from '../api/orderApi';
import type { Order } from '../types/order';
import { ClipboardList, ArrowLeft, Calendar, MapPin, Phone, Package, Trash } from 'lucide-react';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyOrders(user.id);
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch your orders.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: number) => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrder(orderId, user.id);
      // Refresh list
      fetchOrders();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Failed to cancel order.');
      }
    }
  };

  // Helper to color status badges
  const getStatusBadgeStyle = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PLACED') return { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' }; // grey
    if (s === 'CONFIRMED') return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' }; // blue
    if (s === 'SHIPPED') return { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' }; // orange
    if (s === 'DELIVERED') return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }; // green
    return { color: '#f87171', bg: 'rgba(248,113,113,0.1)' }; // red / CANCELLED
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
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Your Orders</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Track shipping progress and review purchases</p>
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
          <p style={{ marginTop: '16px' }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          border: '1px solid var(--card-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <ClipboardList className="w-16 h-16 text-purple-400 opacity-60" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>No orders found</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
            You haven't placed any orders yet.
          </p>
          <button onClick={() => navigate('/')} className="btn" style={{ maxWidth: '200px', margin: '0 auto', cursor: 'pointer' }}>
            Browse Shop
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {orders.map((order) => {
            const badge = getStatusBadgeStyle(order.status);
            return (
              <div 
                key={order.id} 
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-main)'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  gap: '12px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order #{order.id}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin className="w-3.5 h-3.5" />
                        {order.shippingAddress}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone className="w-3.5 h-3.5" />
                        {order.phone}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Status Badge */}
                    <span style={{
                      color: badge.color,
                      background: badge.bg,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {order.status}
                    </span>

                    {/* Cancel Button */}
                    {order.status.toUpperCase() === 'PLACED' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {order.items.map((item) => (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <h4 
                            style={{ fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => navigate(`/product/${item.productId}`)}
                          >
                            {item.title}
                          </h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {item.quantity} × ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total amount summary */}
                <div style={{
                  borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                  marginTop: '20px',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Package className="w-4 h-4 text-purple-400" />
                    COD Payment Method
                  </span>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '12px', fontSize: '0.9rem' }}>Order Total:</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
