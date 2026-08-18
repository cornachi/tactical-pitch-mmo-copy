import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.login({ email, password });
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Falha ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // O SDK redireciona para o fluxo OAuth do Google e retorna ao app.
      await base44.auth.loginWithProvider('google', '/');
    } catch (err) {
      setError(err?.message || 'Falha no login com Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-md border border-slate-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-lime-500 rounded-lg flex items-center justify-center mx-auto text-white font-bold text-xl">
            ⚽
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tactical Pitch MMO</h1>
          <p className="text-sm text-slate-500">Acesse sua conta para jogar</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-lg shadow-sm border border-slate-200 transition-colors flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            'Conectando...'
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Entrar com Google
            </>
          )}
        </Button>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase absolute">
            OU ENTRAR COM E-MAIL
          </span>
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
            disabled={loading || googleLoading}
            className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Entrando...' : 'Log in'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <Link to="/register" className="text-lime-600 font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}