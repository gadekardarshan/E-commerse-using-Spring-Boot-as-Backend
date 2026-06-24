import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword } from '../api/userApi';
import { User, Shield, Info } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfileState } = useAuth();

  // Profile Edit fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  // Password Change fields
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Status indicators
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileSuccess, setProfileSuccess] = useState<string>('');
  const [profileError, setProfileError] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await getUserProfile(user.id);
        setName(data.name);
        setEmail(data.email);
      } catch (err) {
        setProfileError('Failed to load profile details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim() || !email.trim()) {
      setProfileError('Name and email cannot be empty.');
      return;
    }

    if (!user) return;
    try {
      await updateUserProfile(user.id, name, email);
      updateProfileState(name, email);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError('Failed to update profile.');
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (!user) return;
    try {
      await changePassword(user.id, oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
        <p>Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <header className="products-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="products-title" style={{ fontSize: '2rem', fontWeight: 700 }}>Account Settings</h1>
          <p className="products-subtitle" style={{ color: 'var(--text-secondary)' }}>Manage your personal details and account security</p>
        </div>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Profile Card */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-main)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User className="w-5 h-5 text-purple-400" />
            Update Profile
          </h2>

          {profileError && (
            <div className="alert alert-error" style={{ padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem' }}>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="alert alert-success" style={{ padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem' }}>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <button type="submit" className="btn" style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'white',
              background: 'var(--btn-gradient)',
              height: '44px',
              marginTop: '12px'
            }}>
              Save Profile Edits
            </button>
          </form>
        </div>

        {/* Security / Password Card */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: 'var(--shadow-main)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield className="w-5 h-5 text-purple-400" />
            Change Password
          </h2>

          {passwordError && (
            <div className="alert alert-error" style={{ padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem' }}>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="alert alert-success" style={{ padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem' }}>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="old-pass">Current Password</label>
              <input
                id="old-pass"
                type="password"
                className="form-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-pass">New Password</label>
              <input
                id="new-pass"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Min 6 letters, 1 uppercase, 1 special symbol.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">Confirm New Password</label>
              <input
                id="confirm-pass"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn" style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'white',
              background: 'var(--btn-gradient)',
              height: '44px',
              marginTop: '12px'
            }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
