import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();
const GUEST_DATA_KEY = 'guest_game_data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedGuest = localStorage.getItem('guest_user');
    return savedGuest ? JSON.parse(savedGuest) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Se for um usuário convidado local, não chama o backend
      if (user?.isGuest) {
        setLoading(false);
        return;
      }

      try {
        if (typeof base44?.auth?.me === 'function') {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Ignora o erro 401 de não autenticado para não sujar o console
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Math.random().toString(36).substr(2, 9)}`,
      name: `Técnico #${Math.floor(1000 + Math.random() * 9000)}`,
      isGuest: true,
    };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const logout = () => {
    localStorage.removeItem('guest_user');
    localStorage.removeItem(GUEST_DATA_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
