import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, changeUserRole, toggleUserBlock, deleteUser, createAdminUser } from '../api/userApi';
import type { UserResponse } from '../types/auth';
import { ArrowLeft, User, Trash2, Ban, Unlock, Plus, X, Info } from 'lucide-react';

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Modal states for creating new admin manually
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load user accounts.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, currentRole: string) => {
    if (currentAdmin && currentAdmin.id === userId) {
      setError('You cannot change your own role.');
      return;
    }

    const newRole = currentRole.toUpperCase() === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      await changeUserRole(userId, newRole);
      setSuccess('User role changed successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update user role.');
      }
    }
  };

  const handleToggleBlock = async (userId: number) => {
    if (currentAdmin && currentAdmin.id === userId) {
      setError('You cannot block your own account.');
      return;
    }

    try {
      await toggleUserBlock(userId);
      setSuccess('User block status updated!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to toggle block status.');
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (currentAdmin && currentAdmin.id === userId) {
      setError('You cannot delete your own account.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this user? This action is irreversible.')) return;

    try {
      await deleteUser(userId);
      setSuccess('User deleted successfully!');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete user.');
      }
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      await createAdminUser(adminName, adminEmail, adminPassword);
      setSuccess(`Admin account created for ${adminName} successfully!`);
      setIsModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create admin user.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <header className="products-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Manage Users</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Review registered accounts, block users, or toggle access roles</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
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
          <button 
            onClick={() => {
              setAdminName('');
              setAdminEmail('');
              setAdminPassword('');
              setError('');
              setIsModalOpen(true);
            }} 
            className="btn" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        </div>
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
          <p>Loading accounts database...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--card-border)' }}>
          <p>No user accounts found.</p>
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
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>User Details</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Role</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = !!(currentAdmin && currentAdmin.id === u.id);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle' }}>
                    <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '50%',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem' }}>{u.name} {isSelf && <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>(You)</span>}</span>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => handleRoleChange(u.id, u.role)}
                        disabled={isSelf}
                        style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          color: '#a78bfa',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: isSelf ? 'default' : 'pointer'
                        }}
                      >
                        {u.role}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.95rem' }}>
                      {u.blocked ? (
                        <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Ban className="w-4 h-4" /> Blocked
                        </span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User className="w-4 h-4 text-emerald-400" /> Active
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {!isSelf && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* Block/Unblock toggle button */}
                          <button 
                            onClick={() => handleToggleBlock(u.id)}
                            style={{ 
                              background: u.blocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                              border: u.blocked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)', 
                              padding: '8px', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              color: u.blocked ? '#10b981' : '#f59e0b',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={u.blocked ? 'Unblock user' : 'Block user'}
                          >
                            {u.blocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>

                          {/* Delete user button */}
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                            title="Delete user account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Admin Creation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-gradient)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
              Add Admin Manually
            </h2>

            <form onSubmit={handleCreateAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Min 6 letters, 1 uppercase, 1 special symbol.</span>
                </div>
              </div>

              <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '12px', height: '44px', cursor: 'pointer', fontWeight: 600 }}>
                {isSubmitting ? 'Creating admin...' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
