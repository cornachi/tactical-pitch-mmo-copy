import React, { createContext, useContext, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const GUEST_DATA_KEY = 'guest_game_data';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedGuest = localStorage.getItem('guest_user');
    return savedGuest ? JSON.parse(savedGuest) : null;
  });

  // Recupera ou inicializa os dados do jogo do convidado
  const getGuestData = () => {
    const saved = localStorage.getItem(GUEST_DATA_KEY);
    if (saved) return JSON.parse(saved);

    const initialData = {
      coins: 1000,
      wins: 0,
      losses: 0,
      tactics: '4-3-3',
      teamName: 'Meu Time FC',
    };
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(initialData));
    return initialData;
  };

  // Salva qualquer alteração feita pelo convidado
  const updateGuestData = (newData) => {
    const current = getGuestData();
    const updated = { ...current, ...newData };
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated));
    return updated;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Math.random().toString(36).substr(2, 9)}`,
      name: `Técnico #${Math.floor(1000 + Math.random() * 9000)}`,
      isGuest: true,
    };
    localStorage.setItem('guest_user', JSON.stringify(guestUser));
    getGuestData(); // Inicializa dados do time
    setUser(guestUser);
  };

  // Converte a conta de Convidado para Conta Real enviando o progresso acumulado
  const convertGuestToAccount = async ({ email, password, name }) => {
    const guestProgress = getGuestData();

    // Cria a conta no backend enviando o progresso acumulado
    const newUser = await base44.auth.register({
      email,
      password,
      name,
      gameData: guestProgress,
    });

    // Limpa os dados temporários após vincular com sucesso
    localStorage.removeItem('guest_user');
    localStorage.removeItem(GUEST_DATA_KEY);

    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('guest_user');
    localStorage.removeItem(GUEST_DATA_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsGuest,
        getGuestData,
        updateGuestData,
        convertGuestToAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
