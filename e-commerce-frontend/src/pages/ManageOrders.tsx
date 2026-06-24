import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../api/orderApi';
import type { Order } from '../types/order';
import { ArrowLeft } from 'lucide-react';

const ManageOrders: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchOrdersList = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch orders.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, []);

  const handleStatusChange = async (orderId: number, nextStatus: string) => {
    setError('');
    try {
      await updateOrderStatus(orderId, nextStatus);
      setSuccess(`Order #${orderId} status updated to ${nextStatus}!`);
      fetchOrdersList();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update status.');
      }
    }
  };

  // Helper to color status badges
  const getStatusStyle = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PLACED') return { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
    if (s === 'CONFIRMED') return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' };
    if (s === 'SHIPPED') return { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' };
    if (s === 'DELIVERED') return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' };
    return { color: '#f87171', bg: 'rgba(248,113,113,0.1)' }; // CANCELLED
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Manage Orders</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Track customer deliveries and transition shipment states</p>
        </div>
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="btn logout-btn" 
          style={{ 
            borderColor: 'rgba(255,255,255,0.2)', 
            color: 'var(--text-secondary)', 
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <span>{success}</span>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container" style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
          <p>Loading customer orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <p>No customer orders placed yet.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-main)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Delivery Info</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Items</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Price</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const badge = getStatusStyle(order.status);
                const isSettled = order.status.toUpperCase() === 'DELIVERED' || order.status.toUpperCase() === 'CANCELLED';
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>
                    <td style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: 700 }}>#{order.id}</td>
                    <td style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>Phone: {order.phone}</span>
                      <span style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '200px', wordBreak: 'break-word' }}>{order.shippingAddress}</span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {order.items.map((item) => (
                          <li key={item.productId} style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            • {item.title} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.95rem', fontWeight: 700 }}>${order.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        color: badge.color,
                        background: badge.bg,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {isSettled ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Archived</span>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--input-border)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="PLACED">Placed</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
