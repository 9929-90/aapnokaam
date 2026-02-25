import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

// Separate component for axios interceptor setup
const AxiosInterceptorSetup = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Check if we're not already on a login page to prevent redirect loops
          const currentPath = location.pathname;
          const isLoginPage = currentPath === '/login' || currentPath === '/worker-login';
          
          if (!isLoginPage) {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            
            // Determine which login page to redirect to based on current path
            const isWorkerPath = currentPath.includes('/worker');
            const loginPath = isWorkerPath ? '/worker-login' : '/login';
            
            // Redirect to login with session expired message
            navigate(loginPath, { 
              replace: true,
              state: { 
                message: 'Your session has expired. Please login again.',
                from: currentPath
              }
            });
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, location, setUser]);

  return children;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (authResponse) => {
    const userData = {
      userId: authResponse.userId,
      username: authResponse.username,
      role: authResponse.role,
      token: authResponse.token
    };
    
    // Store in localStorage
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify({
      userId: authResponse.userId,
      username: authResponse.username,
      role: authResponse.role
    }));
    
    // Update state
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser, // Export setUser for interceptor
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the interceptor setup component
export const AuthInterceptor = AxiosInterceptorSetup;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;