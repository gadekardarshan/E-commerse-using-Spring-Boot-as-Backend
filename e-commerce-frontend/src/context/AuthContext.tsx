import React, { createContext, useState, useEffect, useContext } from 'react';
import type { UserResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { loginUser, registerUser } from '../services/authService';

// Define structure of the Auth Context
export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<UserResponse>;
  register: (data: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
  updateProfileState: (name: string, email: string) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component wrapping the application to share authentication state
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and load saved session details from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Perform login request, store token in local storage, and set state
  const login = async (data: LoginRequest): Promise<UserResponse> => {
    setLoading(true);
    try {
      const response = await loginUser(data);
      if (response && response.token) {
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        setUser(response);
        setToken(response.token);
      }
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Perform registration request, store token, and set state
  const register = async (data: RegisterRequest): Promise<UserResponse> => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      if (response && response.token) {
        localStorage.setItem('user', JSON.stringify(response));
        localStorage.setItem('token', response.token);
        setUser(response);
        setToken(response.token);
      }
      return response;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Log user out, clearing token and profile state
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Sync profile edits (name, email) into current context and localStorage
  const updateProfileState = (name: string, email: string) => {
    if (user) {
      const updatedUser = { ...user, name, email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext conveniently
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
