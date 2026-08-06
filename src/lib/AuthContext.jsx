import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setAuthError({ type: 'auth_required', error });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const loggedUser = await base44.auth.login(credentials);
    setUser(loggedUser);
    setAuthError(null);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await base44.auth.logout();
    } catch (e) {
      // Ignora erro de logout
    }
    setUser(null);
    setAuthError({ type: 'auth_required' });
  };

  const navigateToLogin = () => {
    setAuthError({ type: 'auth_required' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        setAuthError,
        checkAuth,
        login,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
