import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboardApi';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  Package, 
  Layers, 
  ListOrdered, 
  UserCheck 
} from 'lucide-react';

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: any[];
  topSellingProducts: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
        <p>Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <header className="products-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2.2rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Welcome to the store manager control center</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Sub-Navigation Admin Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <Link to="/admin/products" style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}>
            <Package className="w-5 h-5 text-purple-400" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Manage Products</div>
          </div>
        </Link>
        <Link to="/admin/categories" style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'}>
            <Layers className="w-5 h-5 text-pink-400" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Manage Categories</div>
          </div>
        </Link>
        <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)'}>
            <ListOrdered className="w-5 h-5 text-blue-400" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Manage Orders</div>
          </div>
        </Link>
        <Link to="/admin/users" style={{ textDecoration: 'none', color: 'white' }}>
          <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}>
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Manage Users</div>
          </div>
        </Link>
      </div>

      {/* Widget Cards Grid */}
      {stats && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {/* Revenue */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Revenue</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>${stats.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Orders */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(96, 165, 250, 0.15)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Orders</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalOrders}</span>
              </div>
            </div>

            {/* Products */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Products</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalProducts}</span>
              </div>
            </div>

            {/* Users */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.15)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Users</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalUsers}</span>
              </div>
            </div>
          </div>

          {/* Tables: Recent Orders & Top Selling Products */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '32px'
          }}>
            {/* Recent Orders List */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Recent Orders</h2>
              {stats.recentOrders.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No orders placed yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.recentOrders.map((ord) => (
                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>Order #{ord.id}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {new Date(ord.orderDate).toLocaleDateString()} • {ord.items.length} item(s)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>${ord.totalAmount.toFixed(2)}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          background: ord.status === 'DELIVERED' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                          color: ord.status === 'DELIVERED' ? '#4ade80' : 'white'
                        }}>{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Selling Products List */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Top Selling Products</h2>
              {stats.topSellingProducts.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No product sales recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.topSellingProducts.map((prod) => (
                    <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={prod.image} alt={prod.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Category: {prod.category} • ${prod.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
