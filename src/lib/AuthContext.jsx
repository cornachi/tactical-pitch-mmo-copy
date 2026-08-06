import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Carrega public settings sem travar a tela
        setIsLoadingPublicSettings(false);

        // Tenta obter usuário logado
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setAuthError(null);
      } catch (error) {
        setUser(null);
        // Trata erro de não autenticado (401) sem quebrar o app
        if (error?.status === 401 || error?.response?.status === 401 || error?.message?.includes('Authentication required')) {
          setAuthError({ type: 'auth_required' });
        } else if (error?.type === 'user_not_registered') {
          setAuthError({ type: 'user_not_registered' });
        } else {
          setAuthError({ type: 'auth_required' });
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const loggedUser = await base44.auth.login(credentials);
    setUser(loggedUser);
    setAuthError(null);
    return loggedUser;
  };

  const logout = async () => {
    await base44.auth.logout();
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
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
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
