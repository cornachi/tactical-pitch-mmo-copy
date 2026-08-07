import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Falha ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-lime-500 rounded-lg flex items-center justify-center mx-auto text-white font-bold text-xl">
            ➔]
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tactical Pitch MMO</h1>
          <p className="text-sm text-slate-500">Escolha como deseja acessar</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Botão de Convidado sem cadastro */}
        <Button
          type="button"
          onClick={handleGuestClick}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow transition-colors"
        >
          🎮 Jogar como Convidado
        </Button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase absolute">OU ENTRAR COM</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Log in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
