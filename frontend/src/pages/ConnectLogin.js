import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export function ConnectLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('customer'); // customer, staff

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('connect_token');
    const user = localStorage.getItem('connect_user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        redirectByRole(userData.role);
      } catch (e) {
        localStorage.removeItem('connect_token');
        localStorage.removeItem('connect_user');
      }
    }
  }, []);

  const redirectByRole = (role) => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'customer':
        navigate('/connect/client');
        break;
      case 'technician':
        navigate('/connect/tech');
        break;
      case 'admin':
        navigate('/connect/admin');
        break;
      default:
        navigate('/connect/client');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = loginType === 'customer' 
        ? '/api/connect/login/customer'
        : '/api/connect/login/staff';

      const body = loginType === 'customer'
        ? { email }
        : { email, password };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao fazer login');
      }

      // Store auth data
      localStorage.setItem('connect_token', data.token);
      localStorage.setItem('connect_user', JSON.stringify(data.user));

      // Callback to parent
      if (onLogin) {
        onLogin(data.user);
      }

      // Redirect based on role
      redirectByRole(data.user.role);

    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400 mb-4">
            <Zap className="w-8 h-8 text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Obelisco Connect</h1>
          <p className="text-zinc-400 mt-1">Aceda a sua conta</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-zinc-900 rounded-xl">
          <button
            type="button"
            onClick={() => setLoginType('customer')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              loginType === 'customer'
                ? 'bg-yellow-400 text-zinc-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => setLoginType('staff')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              loginType === 'staff'
                ? 'bg-yellow-400 text-zinc-900'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Equipa / Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={loginType === 'customer' ? 'email@subscricao.pt' : 'email@obelisco.pt'}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                data-testid="connect-email-input"
              />
            </div>
            {loginType === 'customer' && (
              <p className="mt-1.5 text-xs text-zinc-500">
                Use o email da sua subscricao Obelisco Care
              </p>
            )}
          </div>

          {/* Password (only for staff) */}
          {loginType === 'staff' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
                  data-testid="connect-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-zinc-900 py-3.5 rounded-xl font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            data-testid="connect-login-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                A entrar...
              </>
            ) : (
              <>
                {loginType === 'customer' ? 'Aceder com Email' : 'Entrar'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-yellow-400 transition"
          >
            ← Voltar ao site
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default ConnectLogin;
