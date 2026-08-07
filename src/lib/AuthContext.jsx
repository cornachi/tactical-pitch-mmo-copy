import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Recupera convidado salvo para não perder a sessão ao recarregar a página
    const savedGuest = localStorage.getItem('guest_user');
    return savedGuest ? JSON.parse(savedGuest) : null;
  });
  const [loading, setLoading] = useState(false);

  // Login tradicional
  const login = async (credentials) => {
    // Sua lógica existente de login
  };

  // Login como Convidado
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
