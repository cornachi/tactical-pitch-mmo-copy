import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

// Autenticação obrigatória: não há mais modo convidado. O estado de carregamento
// aguarda a verificação real da sessão com base44.auth.me() antes de liberar as rotas.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (typeof base44?.auth?.me === 'function') {
          const currentUser = await base44.auth.me();
          if (active) setUser(currentUser);
        }
      } catch (err) {
        // Não autenticado — user permanece null e a rota redireciona para /login.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const logout = async () => {
    try {
      await base44.auth.logout();
    } catch (e) {
      /* ignore */
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);