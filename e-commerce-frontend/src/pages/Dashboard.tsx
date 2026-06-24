import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserResponse } from '../types/auth';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userStr) as UserResponse;
      if (parsedUser && parsedUser.name && parsedUser.email) {
        setUser(parsedUser);
      } else {
        throw new Error('Invalid user format');
      }
    } catch (err) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-secondary)' }}>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', fontWeight: 500 }}>User Profile</h2>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '4px' }}>Welcome, {user.name}</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-user-info">
        <div className="info-item">
          <span className="info-label">Full Name</span>
          <span className="info-value">{user.name}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Email Address</span>
          <span className="info-value">{user.email}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Access Level / Role</span>
          <span className="info-value">
            <span className="role-badge">{user.role || 'user'}</span>
          </span>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
